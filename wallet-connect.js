// Wallet Connect Module for ZonatOne
// Using Solana + Phantom Wallet

// ===== Configuration =====
const ADMIN_WALLET = '8ZiNazfyXajh9C4jgFjPLrc8EKwKRSPLCG6Z8MA4cCpG';
const CAMPAIGN_FEE_SOL = 0.4; // SOL (approx $57)

// ===== Wallet State =====
let walletConnected = false;
let walletAddress = null;
let isAdmin = false;

// ===== Check Phantom Wallet =====
function isPhantomInstalled() {
    return window.solana && window.solana.isPhantom;
}

// ===== Connect Wallet =====
async function connectWallet() {
    try {
        if (!isPhantomInstalled()) {
            showNotification('⚠️ Phantom Wallet tidak terdeteksi. Silakan install dari phantom.app');
            window.open('https://phantom.app/', '_blank');
            return false;
        }

        const response = await window.solana.connect();
        walletAddress = response.publicKey.toString();
        walletConnected = true;
        isAdmin = walletAddress === ADMIN_WALLET;

        updateWalletUI();
        refreshAdminUI(); // Re-render cards to show/hide admin buttons

        if (isAdmin) {
            showNotification('👑 Terhubung sebagai Admin! Akses penuh.');
        } else {
            showNotification(`✅ Wallet terhubung: ${shortenAddress(walletAddress)}`);
        }

        console.log('✅ Wallet connected:', walletAddress);
        console.log('👑 Is Admin:', isAdmin);

        return true;
    } catch (error) {
        console.error('Wallet connection failed:', error);
        showNotification('❌ Gagal menghubungkan wallet');
        return false;
    }
}

// ===== Disconnect Wallet =====
async function disconnectWallet() {
    try {
        if (window.solana) {
            await window.solana.disconnect();
        }
        walletConnected = false;
        walletAddress = null;
        isAdmin = false;
        updateWalletUI();
        refreshAdminUI(); // Re-render cards to hide admin buttons
        showNotification('👋 Wallet terputus');
    } catch (error) {
        console.error('Disconnect failed:', error);
    }
}

// ===== Shorten Address =====
function shortenAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// ===== Update UI =====
function updateWalletUI() {
    const connectBtn = document.getElementById('walletConnectBtn');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddressSpan = document.getElementById('walletAddress');
    const adminBadge = document.getElementById('adminBadge');
    const openAdminBtn = document.getElementById('openAdminBtn');

    if (walletConnected) {
        if (connectBtn) connectBtn.style.display = 'none';
        if (walletInfo) walletInfo.style.display = 'flex';
        if (walletAddressSpan) walletAddressSpan.textContent = shortenAddress(walletAddress);
        if (adminBadge) adminBadge.style.display = isAdmin ? 'inline-block' : 'none';
        // Show Buat Airdrop only for admin
        if (openAdminBtn) openAdminBtn.style.display = isAdmin ? 'flex' : 'none';
    } else {
        if (connectBtn) connectBtn.style.display = 'flex';
        if (walletInfo) walletInfo.style.display = 'none';
        // Hide Buat Airdrop for non-connected users
        if (openAdminBtn) openAdminBtn.style.display = 'none';
    }
}

// ===== Refresh Admin UI (re-render cards) =====
function refreshAdminUI() {
    // Re-render cards to show/hide admin buttons
    if (typeof renderAirdrops === 'function') {
        renderAirdrops();
    }
    if (typeof renderCampaigns === 'function') {
        renderCampaigns();
    }
    if (typeof renderCampaignCarousel === 'function') {
        renderCampaignCarousel();
    }
    if (typeof renderHeroCarousel === 'function') {
        renderHeroCarousel();
    }

    // Update banner admin UI
    if (typeof updateBannerAdminUI === 'function') {
        updateBannerAdminUI();
    }
}

// ===== Check Campaign Access =====
function canCreateCampaign() {
    if (!walletConnected) {
        showNotification('⚠️ Hubungkan wallet terlebih dahulu untuk membuat Star Kampanye');
        return false;
    }

    if (isAdmin) {
        return true; // Admin = free access
    }

    // Non-admin needs to pay
    return 'needs_payment';
}

// ===== Payment for Campaign =====
async function payForCampaign() {
    if (!walletConnected) {
        showNotification('⚠️ Hubungkan wallet terlebih dahulu');
        return false;
    }

    if (isAdmin) {
        return true; // Admin = free
    }

    try {
        showNotification('💳 Memproses pembayaran...');

        // Create transaction to send SOL to admin wallet
        const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = solanaWeb3;

        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const fromPubkey = new PublicKey(walletAddress);
        const toPubkey = new PublicKey(ADMIN_WALLET);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromPubkey,
                toPubkey: toPubkey,
                lamports: CAMPAIGN_FEE_SOL * LAMPORTS_PER_SOL
            })
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        // Request signature from Phantom
        const signed = await window.solana.signTransaction(transaction);

        // Send transaction
        const signature = await connection.sendRawTransaction(signed.serialize());

        // Wait for confirmation
        await connection.confirmTransaction(signature);

        showNotification(`✅ Pembayaran berhasil! TX: ${signature.slice(0, 8)}...`);
        console.log('Payment successful:', signature);

        return true;
    } catch (error) {
        console.error('Payment failed:', error);
        if (error.message.includes('User rejected')) {
            showNotification('❌ Pembayaran dibatalkan');
        } else {
            showNotification('❌ Pembayaran gagal: ' + error.message);
        }
        return false;
    }
}

// ===== Auto-connect if already authorized =====
async function checkWalletConnection() {
    if (isPhantomInstalled() && window.solana.isConnected) {
        try {
            const response = await window.solana.connect({ onlyIfTrusted: true });
            walletAddress = response.publicKey.toString();
            walletConnected = true;
            isAdmin = walletAddress === ADMIN_WALLET;
            updateWalletUI();
            console.log('🔄 Auto-connected wallet:', walletAddress);
        } catch (error) {
            // User hasn't authorized yet, that's fine
            console.log('Wallet not pre-authorized');
        }
    }
}

// ===== Listen for wallet events =====
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (isPhantomInstalled()) {
            // Check for existing connection
            checkWalletConnection();

            // Listen for disconnect
            window.solana.on('disconnect', () => {
                walletConnected = false;
                walletAddress = null;
                isAdmin = false;
                updateWalletUI();
                console.log('Wallet disconnected');
            });

            // Listen for account change
            window.solana.on('accountChanged', (publicKey) => {
                if (publicKey) {
                    walletAddress = publicKey.toString();
                    isAdmin = walletAddress === ADMIN_WALLET;
                    updateWalletUI();
                    console.log('Account changed:', walletAddress);
                } else {
                    disconnectWallet();
                }
            });
        }
    });
}

console.log('💜 Solana Wallet Module loaded');
