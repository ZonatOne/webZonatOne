// ===== State Management =====
let airdrops = [];
let campaigns = [];
let currentImageData = null;
let currentLogoData = null;
let currentBannerData = null;
let currentPage = 'home';
let currentFilter = 'all';
let editingId = null;
let currentSlide = 0;
let autoSlideInterval = null;

// ===== DOM Elements =====
const adminPanel = document.getElementById('adminPanel');
const openAdminBtn = document.getElementById('openAdminBtn');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const cancelBtn = document.getElementById('cancelBtn');
const airdropForm = document.getElementById('airdropForm');
const airdropsGrid = document.getElementById('airdropsGrid');
const totalAirdropsEl = document.getElementById('totalAirdrops');

// Upload elements
const uploadArea = document.getElementById('uploadArea');
const logoUpload = document.getElementById('logoUpload');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');

// Campaign elements
const campaignPanel = document.getElementById('campaignPanel');
const openCampaignBtn = document.getElementById('openCampaignBtn');
const closeCampaignBtn = document.getElementById('closeCampaignBtn');
const cancelCampaignBtn = document.getElementById('cancelCampaignBtn');
const campaignForm = document.getElementById('campaignForm');
const campaignsSection = document.getElementById('campaignsSection');
const airdropsSection = document.querySelector('.airdrops-section');
const campaignsGrid = document.getElementById('campaignsGrid');

// Campaign upload elements
const uploadLogoArea = document.getElementById('uploadLogoArea');
const logoUploadCampaign = document.getElementById('logoUploadCampaign');
const uploadLogoPlaceholder = document.getElementById('uploadLogoPlaceholder');
const logoPreview = document.getElementById('logoPreview');
const logoPreviewImg = document.getElementById('logoPreviewImg');
const removeLogoBtn = document.getElementById('removeLogoBtn');

const uploadBannerArea = document.getElementById('uploadBannerArea');
const bannerUploadCampaign = document.getElementById('bannerUploadCampaign');
const uploadBannerPlaceholder = document.getElementById('uploadBannerPlaceholder');
const bannerPreview = document.getElementById('bannerPreview');
const bannerPreviewImg = document.getElementById('bannerPreviewImg');
const removeBannerBtn = document.getElementById('removeBannerBtn');

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    loadAirdrops();
    loadCampaigns();
    createSampleAirdrops();
    createSampleCampaigns();
    renderAirdrops();
    renderCampaigns();
    renderCampaignCarousel(); // Render AFTER samples are created
    setupEventListeners();
    startAutoSlide();
});

// ===== Event Listeners =====
function setupEventListeners() {
    // Modal controls
    openAdminBtn.addEventListener('click', openAdminPanel);
    closeAdminBtn.addEventListener('click', closeAdminPanel);
    cancelBtn.addEventListener('click', closeAdminPanel);

    // Close modal when clicking outside
    adminPanel.addEventListener('click', (e) => {
        if (e.target === adminPanel) {
            closeAdminPanel();
        }
    });

    // Form submission
    airdropForm.addEventListener('submit', handleFormSubmit);

    // Image upload
    uploadArea.addEventListener('click', () => logoUpload.click());
    logoUpload.addEventListener('change', handleImageUpload);
    removeImage.addEventListener('click', (e) => {
        e.stopPropagation();
        clearImage();
    });

    // Prevent form submission on enter in input fields
    airdropForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });

    // Navigation menu
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            switchPage(page);
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterText = btn.textContent.toLowerCase();
            if (filterText === 'semua') currentFilter = 'all';
            else if (filterText === 'aktif') currentFilter = 'active';
            else if (filterText === 'segera') currentFilter = 'upcoming';

            renderAirdrops();
        });
    });

    // Campaign modal controls
    if (openCampaignBtn) {
        openCampaignBtn.addEventListener('click', openCampaignPanel);
    }
    if (closeCampaignBtn) {
        closeCampaignBtn.addEventListener('click', closeCampaignPanel);
    }
    if (cancelCampaignBtn) {
        cancelCampaignBtn.addEventListener('click', closeCampaignPanel);
    }

    // Campaign form submission
    if (campaignForm) {
        campaignForm.addEventListener('submit', handleCampaignSubmit);
    }

    // Campaign uploads
    if (uploadLogoArea) {
        uploadLogoArea.addEventListener('click', () => logoUploadCampaign.click());
    }
    if (logoUploadCampaign) {
        logoUploadCampaign.addEventListener('change', handleLogoUpload);
    }
    if (removeLogoBtn) {
        removeLogoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearLogo();
        });
    }

    if (uploadBannerArea) {
        uploadBannerArea.addEventListener('click', () => bannerUploadCampaign.click());
    }
    if (bannerUploadCampaign) {
        bannerUploadCampaign.addEventListener('change', handleBannerUpload);
    }
    if (removeBannerBtn) {
        removeBannerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearBanner();
        });
    }

    // Close campaign modal when clicking outside
    if (campaignPanel) {
        campaignPanel.addEventListener('click', (e) => {
            if (e.target === campaignPanel) {
                closeCampaignPanel();
            }
        });
    }
}

// ===== Modal Functions =====
function openAdminPanel() {
    adminPanel.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
    adminPanel.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

function resetForm() {
    airdropForm.reset();
    clearImage();
    editingId = null;
    document.querySelector('.panel-header h3').textContent = 'Buat Info Airdrop Baru';
    document.querySelector('.btn-primary').textContent = 'Publikasikan Airdrop';
}

// ===== Image Upload Functions =====
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        previewImg.src = currentImageData;
        uploadPlaceholder.style.display = 'none';
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    currentImageData = null;
    logoUpload.value = '';
    previewImg.src = '';
    uploadPlaceholder.style.display = 'flex';
    imagePreview.style.display = 'none';
}

// ===== Form Submission =====
function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        id: editingId || Date.now(),
        title: document.getElementById('airdropTitle').value,
        description: document.getElementById('airdropDescription').value,
        reward: document.getElementById('airdropReward').value || 'TBA',
        deadline: document.getElementById('airdropDeadline').value || 'Ongoing',
        website: document.getElementById('airdropWebsite').value,
        category: document.getElementById('airdropCategory').value,
        steps: document.getElementById('airdropSteps').value,
        logo: currentImageData,
        createdAt: editingId ? airdrops.find(a => a.id === editingId).createdAt : new Date().toISOString()
    };


    if (editingId) {
        // Update existing airdrop
        const index = airdrops.findIndex(a => a.id === editingId);
        if (index !== -1) {
            airdrops[index] = formData;
        }
        editingId = null;
    } else {
        // Add to airdrops array
        airdrops.unshift(formData);
    }

    // Save to localStorage
    saveAirdrops();

    // Re-render
    renderAirdrops();

    // Close panel and reset form
    closeAdminPanel();

    // Show success message
    showNotification('Airdrop berhasil dipublikasikan! 🎉');
}

// ===== Navigation Functions =====
function switchPage(page) {
    currentPage = page;

    // Update active state
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });


    const airdropsSection = document.querySelector('.airdrops-section');
    const heroSection = document.querySelector('.hero');
    const campaignsSection = document.getElementById('campaignsSection');

    // Show/hide sections based on page
    if (page === 'campaign') {
        if (airdropsSection) airdropsSection.style.display = 'none';
        if (heroSection) heroSection.style.display = 'none';
        if (campaignsSection) {
            campaignsSection.style.display = 'block';
            renderCampaigns();
        }
    } else if (page === 'home') {
        if (airdropsSection) airdropsSection.style.display = 'block';
        if (heroSection) heroSection.style.display = 'block';
        if (campaignsSection) campaignsSection.style.display = 'none';
    } else {
        // Show notification for other pages
        showNotification(`Halaman ${page.charAt(0).toUpperCase() + page.slice(1)} sedang dalam pengembangan! 🚧`);
    }
}

// ===== Render Functions =====
function renderAirdrops() {
    let filteredAirdrops = airdrops;

    // Apply filters
    if (currentFilter === 'active') {
        filteredAirdrops = airdrops.filter(a => {
            if (a.deadline === 'Ongoing') return true;
            return new Date(a.deadline) >= new Date();
        });
    } else if (currentFilter === 'upcoming') {
        filteredAirdrops = airdrops.filter(a => {
            if (a.deadline === 'Ongoing') return false;
            const deadline = new Date(a.deadline);
            const now = new Date();
            const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24);
            return daysUntil > 0 && daysUntil <= 30;
        });
    }

    if (filteredAirdrops.length === 0) {
        airdropsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                <p style="font-size: 1.5rem; color: var(--text-muted); margin-bottom: 1rem;">
                    ${airdrops.length === 0 ? 'Belum ada airdrop yang dipublikasikan' : 'Tidak ada airdrop yang sesuai filter'}
                </p>
                <p style="color: var(--text-secondary);">
                    ${airdrops.length === 0 ? 'Klik tombol "Buat Airdrop" untuk menambahkan info airdrop pertama' : 'Coba filter lain atau reset filter'}
                </p>
            </div>
        `;
        totalAirdropsEl.textContent = airdrops.length;
        return;
    }

    airdropsGrid.innerHTML = filteredAirdrops.map(airdrop => createAirdropCard(airdrop)).join('');
    totalAirdropsEl.textContent = airdrops.length;
}

function createAirdropCard(airdrop) {
    const logoHtml = airdrop.logo
        ? `<img src="${airdrop.logo}" alt="${airdrop.title}" class="card-logo">`
        : `<div class="card-logo-placeholder">${airdrop.title.charAt(0)}</div>`;

    const deadlineFormatted = airdrop.deadline !== 'Ongoing'
        ? new Date(airdrop.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Ongoing';

    return `
        <div class="airdrop-card" data-id="${airdrop.id}">
            <div class="card-header">
                ${logoHtml}
                <div class="card-title-section">
                    <h4 class="card-title">${airdrop.title}</h4>
                    <span class="card-category">${airdrop.category}</span>
                </div>
            </div>
            <p class="card-description">${airdrop.description}</p>
            <div class="card-info">
                <div class="info-item">
                    <span class="info-label">Reward</span>
                    <span class="info-value">${airdrop.reward}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Deadline</span>
                    <span class="info-value">${deadlineFormatted}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-action" onclick="viewDetails(${airdrop.id})">Detail</button>
                <button class="btn-action primary" onclick="joinAirdrop(${airdrop.id})">Ikuti Airdrop</button>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <button class="btn-action" onclick="editAirdrop(${airdrop.id})" style="flex: 1; font-size: 0.85rem; padding: 0.5rem;">✏️ Edit</button>
                <button class="btn-action" onclick="deleteAirdrop(${airdrop.id})" style="flex: 1; font-size: 0.85rem; padding: 0.5rem; border-color: #ff6b9d; color: #ff6b9d;">🗑️ Hapus</button>
            </div>
        </div>
    `;
}

// ===== Airdrop Actions =====
function viewDetails(id) {
    const airdrop = airdrops.find(a => a.id === id);
    if (!airdrop) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="admin-panel" style="max-width: 800px;">
            <div class="panel-header">
                <h3>${airdrop.title}</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div style="padding: 2rem;">
                <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                    ${airdrop.logo ? `<img src="${airdrop.logo}" style="width: 120px; height: 120px; border-radius: 16px; object-fit: cover;">` : ''}
                    <div>
                        <span class="card-category" style="margin-bottom: 1rem; display: inline-block;">${airdrop.category}</span>
                        <h4 style="margin-bottom: 0.5rem;">Reward: <span style="color: var(--primary-color);">${airdrop.reward}</span></h4>
                        <p style="color: var(--text-muted);">Deadline: ${airdrop.deadline !== 'Ongoing' ? new Date(airdrop.deadline).toLocaleDateString('id-ID') : 'Ongoing'}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: var(--primary-color); margin-bottom: 1rem;">Deskripsi</h4>
                    <p style="color: var(--text-secondary); line-height: 1.8;">${airdrop.description}</p>
                </div>

                ${airdrop.steps ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 1rem;">Langkah-langkah</h4>
                        <pre style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; color: var(--text-secondary); white-space: pre-wrap; line-height: 1.8;">${airdrop.steps}</pre>
                    </div>
                ` : ''}

                ${airdrop.website ? `
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 1rem;">Website</h4>
                        <a href="${airdrop.website}" target="_blank" style="color: var(--primary-color); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                            ${airdrop.website}
                            <span>↗</span>
                        </a>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 1rem;">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">Tutup</button>
                    <button class="btn-primary" onclick="joinAirdrop(${airdrop.id}); this.closest('.modal-overlay').remove();" style="flex: 2;">Ikuti Airdrop</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

function joinAirdrop(id) {
    const airdrop = airdrops.find(a => a.id === id);
    if (!airdrop) return;

    if (airdrop.website) {
        window.open(airdrop.website, '_blank');
    } else {
        showNotification(`Bergabung dengan ${airdrop.title}! Cek detail untuk info lebih lanjut.`);
    }
}

// ===== Local Storage =====
function saveAirdrops() {
    localStorage.setItem('airdrops', JSON.stringify(airdrops));
}

function loadAirdrops() {
    const saved = localStorage.getItem('airdrops');
    if (saved) {
        airdrops = JSON.parse(saved);
    }
}

// ===== Notification =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== Sample Data =====
function createSampleAirdrops() {
    // Only create samples if no airdrops exist
    if (airdrops.length > 0) return;

    const samples = [
        {
            id: Date.now() + 1,
            title: 'LayerZero Airdrop',
            description: 'LayerZero adalah protokol interoperabilitas omnichain yang memungkinkan komunikasi lintas blockchain. Berpartisipasi dalam testnet dan mainnet untuk berpotensi mendapatkan airdrop token $ZRO.',
            reward: '$500 - $2,000',
            deadline: '2026-03-31',
            website: 'https://layerzero.network',
            category: 'Layer 2',
            steps: '1. Kunjungi website LayerZero\n2. Connect wallet (MetaMask/WalletConnect)\n3. Bridge token antar chain\n4. Lakukan minimal 5 transaksi\n5. Tunggu snapshot airdrop',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            title: 'zkSync Era Airdrop',
            description: 'zkSync adalah solusi scaling Layer 2 untuk Ethereum menggunakan teknologi zero-knowledge rollups. Pengguna aktif berpotensi mendapatkan airdrop token governance.',
            reward: '$1,000 - $5,000',
            deadline: 'Ongoing',
            website: 'https://zksync.io',
            category: 'Layer 2',
            steps: '1. Bridge ETH ke zkSync Era\n2. Swap token di DEX (SyncSwap, Mute)\n3. Provide liquidity\n4. Mint NFT di zkSync\n5. Gunakan aplikasi DeFi',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            title: 'Starknet Airdrop',
            description: 'Starknet adalah Layer 2 scaling solution menggunakan STARK proofs. Airdrop untuk early adopters dan pengguna aktif ekosistem Starknet.',
            reward: '$800 - $3,000',
            deadline: '2026-06-30',
            website: 'https://starknet.io',
            category: 'Layer 2',
            steps: '1. Bridge ke Starknet\n2. Deploy smart contract wallet\n3. Gunakan dApps (JediSwap, mySwap)\n4. Participate in governance\n5. Hold STRK tokens',
            logo: null,
            createdAt: new Date().toISOString()
        }
    ];

    airdrops = samples;
    saveAirdrops();
}

// ===== Edit and Delete Functions =====
function editAirdrop(id) {
    const airdrop = airdrops.find(a => a.id === id);
    if (!airdrop) return;

    editingId = id;

    // Fill form with existing data
    document.getElementById('airdropTitle').value = airdrop.title;
    document.getElementById('airdropDescription').value = airdrop.description;
    document.getElementById('airdropReward').value = airdrop.reward === 'TBA' ? '' : airdrop.reward;
    document.getElementById('airdropDeadline').value = airdrop.deadline === 'Ongoing' ? '' : airdrop.deadline;
    document.getElementById('airdropWebsite').value = airdrop.website || '';
    document.getElementById('airdropCategory').value = airdrop.category;
    document.getElementById('airdropSteps').value = airdrop.steps || '';

    // Set image if exists
    if (airdrop.logo) {
        currentImageData = airdrop.logo;
        previewImg.src = currentImageData;
        uploadPlaceholder.style.display = 'none';
        imagePreview.style.display = 'block';
    }

    // Change panel title
    document.querySelector('.panel-header h3').textContent = 'Edit Info Airdrop';
    document.querySelector('.btn-primary').textContent = 'Update Airdrop';

    openAdminPanel();
}

function deleteAirdrop(id) {
    if (!confirm('Yakin ingin menghapus airdrop ini?')) return;

    airdrops = airdrops.filter(a => a.id !== id);
    saveAirdrops();
    renderAirdrops();
    showNotification('Airdrop berhasil dihapus! 🗑️');
}
// ===== Campaign Functions =====

// Campaign Modal Functions
function openCampaignPanel() {
    if (campaignPanel) {
        campaignPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCampaignPanel() {
    if (campaignPanel) {
        campaignPanel.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetCampaignForm();
    }
}

function resetCampaignForm() {
    if (campaignForm) {
        campaignForm.reset();
    }
    clearLogo();
    clearBanner();
}

// Campaign Upload Functions
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size must be less than 2MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentLogoData = e.target.result;
        if (logoPreviewImg) logoPreviewImg.src = currentLogoData;
        if (uploadLogoPlaceholder) uploadLogoPlaceholder.style.display = 'none';
        if (logoPreview) logoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function clearLogo() {
    currentLogoData = null;
    if (logoUploadCampaign) logoUploadCampaign.value = '';
    if (logoPreviewImg) logoPreviewImg.src = '';
    if (uploadLogoPlaceholder) uploadLogoPlaceholder.style.display = 'flex';
    if (logoPreview) logoPreview.style.display = 'none';
}

function handleBannerUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Banner file size must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentBannerData = e.target.result;
        if (bannerPreviewImg) bannerPreviewImg.src = currentBannerData;
        if (uploadBannerPlaceholder) uploadBannerPlaceholder.style.display = 'none';
        if (bannerPreview) bannerPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function clearBanner() {
    currentBannerData = null;
    if (bannerUploadCampaign) bannerUploadCampaign.value = '';
    if (bannerPreviewImg) bannerPreviewImg.src = '';
    if (uploadBannerPlaceholder) uploadBannerPlaceholder.style.display = 'flex';
    if (bannerPreview) bannerPreview.style.display = 'none';
}

// Campaign Form Submission
function handleCampaignSubmit(e) {
    e.preventDefault();

    const formData = {
        id: Date.now(),
        name: document.getElementById('campaignName').value,
        description: document.getElementById('campaignDescription').value,
        website: document.getElementById('campaignWebsite').value,
        budget: document.getElementById('campaignBudget').value || 'TBA',
        startDate: document.getElementById('campaignStartDate').value || 'Sekarang',
        endDate: document.getElementById('campaignEndDate').value || 'Ongoing',
        logo: currentLogoData,
        banner: currentBannerData,
        createdAt: new Date().toISOString()
    };

    campaigns.unshift(formData);
    saveCampaigns();
    renderCampaigns();
    renderCampaignCarousel(); // Update carousel with new campaign
    closeCampaignPanel();
    showNotification('Kampanye berhasil dipublikasikan! ⭐');
}

// Campaign Render Functions
function renderCampaigns() {
    if (!campaignsGrid) return;

    if (campaigns.length === 0) {
        campaignsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                <p style="font-size: 1.5rem; color: var(--text-muted); margin-bottom: 1rem;">
                    Belum ada kampanye yang dipublikasikan
                </p>
                <p style="color: var(--text-secondary);">
                    Klik tombol "Buat Kampanye" untuk menambahkan kampanye pertama
                </p>
            </div>
        `;
        return;
    }

    campaignsGrid.innerHTML = campaigns.map(campaign => createCampaignCard(campaign)).join('');
}

function createCampaignCard(campaign) {
    const logoHtml = campaign.logo
        ? `<img src="${campaign.logo}" alt="${campaign.name}" class="campaign-logo">`
        : `<div class="campaign-logo-placeholder">${campaign.name.charAt(0)}</div>`;

    const bannerHtml = campaign.banner
        ? `<img src="${campaign.banner}" alt="${campaign.name} Banner" class="campaign-banner">`
        : `<div class="campaign-banner"></div>`;

    const startDateFormatted = campaign.startDate !== 'Sekarang'
        ? new Date(campaign.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Sekarang';

    const endDateFormatted = campaign.endDate !== 'Ongoing'
        ? new Date(campaign.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Ongoing';

    return `
        <div class="campaign-card" data-id="${campaign.id}">
            ${bannerHtml}
            <div class="campaign-content">
                ${logoHtml}
                <h4 class="campaign-name">${campaign.name}</h4>
                <p class="campaign-description">${campaign.description}</p>
                <div class="campaign-info">
                    ${campaign.budget !== 'TBA' ? `
                        <div class="campaign-info-item">
                            <span class="campaign-info-label">Budget</span>
                            <span class="campaign-info-value">${campaign.budget}</span>
                        </div>
                    ` : ''}
                    <div class="campaign-info-item">
                        <span class="campaign-info-label">Periode</span>
                        <span class="campaign-info-value">${startDateFormatted} - ${endDateFormatted}</span>
                    </div>
                </div>
                ${campaign.website ? `
                    <div style="margin-top: 1rem;">
                        <a href="${campaign.website}" target="_blank" class="btn-action primary" style="display: block; text-align: center; text-decoration: none;">
                            Kunjungi Website
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Campaign Local Storage
function saveCampaigns() {
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
}

function loadCampaigns() {
    const saved = localStorage.getItem('campaigns');
    if (saved) {
        campaigns = JSON.parse(saved);

        // Migration: Add isStar property to old campaigns if missing
        let needsMigration = false;
        campaigns.forEach(campaign => {
            if (campaign.isStar === undefined) {
                campaign.isStar = false; // Default to false for old campaigns
                needsMigration = true;
            }
        });

        // Save migrated data
        if (needsMigration) {
            saveCampaigns();
        }
    }
}

// Sample Campaigns
function createSampleCampaigns() {
    if (campaigns.length > 0) return;

    const samples = [
        {
            id: Date.now() + 1,
            name: 'Polygon zkEVM Campaign',
            description: 'Join the future of Ethereum scaling with Polygon zkEVM. Participate in our testnet activities and get early access to exclusive features.',
            website: 'https://polygon.technology',
            budget: '$50,000',
            startDate: '2026-01-01',
            endDate: '2026-03-31',
            logo: null,
            banner: null,
            isStar: true,  // ⭐ Star campaign untuk carousel
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            name: 'Arbitrum Odyssey',
            description: 'Explore the Arbitrum ecosystem and complete on-chain quests to earn exclusive NFTs and future airdrop opportunities.',
            website: 'https://arbitrum.io',
            budget: '$100,000',
            startDate: '2026-02-01',
            endDate: '2026-04-30',
            logo: null,
            banner: null,
            isStar: true,  // ⭐ Star campaign untuk carousel
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            name: 'LayerZero Airdrop',
            description: 'LayerZero adalah protokol interoperabilitas omnichain yang memungkinkan pesan lintas berbagai blockchain dengan aman.',
            website: 'https://layerzero.network',
            budget: '$500 - $2,000',
            startDate: '2026-01-15',
            endDate: '2026-03-15',
            logo: null,
            banner: null,
            isStar: true,  // ⭐ Star campaign untuk carousel
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 4,
            name: 'zkSync Era Airdrop',
            description: 'zkSync adalah solusi scaling Layer 2 untuk Ethereum menggunakan teknologi zero-knowledge rollups.',
            website: 'https://zksync.io',
            budget: '$1,000 - $5,000',
            startDate: '2026-01-10',
            endDate: 'Ongoing',
            logo: null,
            banner: null,
            isStar: false,  // Regular campaign
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 5,
            name: 'Starknet Airdrop',
            description: 'Starknet adalah Layer 2 scaling solution menggunakan STARK proofs. Airdrop untuk early adopters dan contributors.',
            website: 'https://starknet.io',
            budget: '$800 - $3,000',
            startDate: '2026-01-20',
            endDate: '2026-06-30',
            logo: null,
            banner: null,
            isStar: false,  // Regular campaign
            createdAt: new Date().toISOString()
        }
    ];

    campaigns = samples;
    saveCampaigns();
}

// ===== Campaign Carousel Functions =====

// Carousel DOM Elements
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselIndicators = document.getElementById('carouselIndicators');
const carouselContainer = document.getElementById('campaignCarousel');

// Render campaign carousel on homepage
function renderCampaignCarousel() {
    if (!carouselTrack) return;

    // Filter untuk only star campaigns
    const starCampaigns = campaigns.filter(c => c.isStar === true);

    if (starCampaigns.length === 0) {
        carouselTrack.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Belum ada kampanye star</p>`;
        // Hide indicators dan arrows jika kosong
        if (carouselIndicators) carouselIndicators.innerHTML = '';
        return;
    }

    // Render star campaign cards only
    carouselTrack.innerHTML = starCampaigns.map(campaign => createCampaignCardForCarousel(campaign)).join('');

    // Setup indicators based on star campaigns
    if (carouselIndicators) {
        const numSlides = starCampaigns.length; // Each star campaign is a slide
        carouselIndicators.innerHTML = Array.from({ length: numSlides }, (_, i) =>
            `<button class="carousel-indicator ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`
        ).join('');

        // Add indicator click listeners
        document.querySelectorAll('.carousel-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                goToSlide(slideIndex);
            });
        });
    }

    // Setup navigation buttons
    if (carouselPrev) {
        carouselPrev.addEventListener('click', () => slideCarousel('prev'));
    }
    if (carouselNext) {
        carouselNext.addEventListener('click', () => slideCarousel('next'));
    }

    // Pause on hover
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', pauseAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);
    }
}

// Create campaign card for carousel (reuse campaign card structure)
function createCampaignCardForCarousel(campaign) {
    const logoHtml = campaign.logo
        ? `<img src="${campaign.logo}" alt="${campaign.name}" class="campaign-logo">`
        : `<div class="campaign-logo-placeholder">${campaign.name.charAt(0)}</div>`;

    const bannerHtml = campaign.banner
        ? `<img src="${campaign.banner}" alt="${campaign.name} Banner" class="campaign-banner">`
        : `<div class="campaign-banner"></div>`;

    const startDateFormatted = campaign.startDate !== 'Sekarang'
        ? new Date(campaign.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Sekarang';

    const endDateFormatted = campaign.endDate !== 'Ongoing'
        ? new Date(campaign.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Ongoing';

    return `
        <div class="campaign-card" data-id="${campaign.id}">
            ${bannerHtml}
            <div class="campaign-content">
                ${logoHtml}
                <h4 class="campaign-name">${campaign.name}</h4>
                <p class="campaign-description">${campaign.description}</p>
                <div class="campaign-info">
                    ${campaign.budget !== 'TBA' ? `
                        <div class="campaign-info-item">
                            <span class="campaign-info-label">Budget</span>
                            <span class="campaign-info-value">${campaign.budget}</span>
                        </div>
                    ` : ''}
                    <div class="campaign-info-item">
                        <span class="campaign-info-label">Periode</span>
                        <span class="campaign-info-value">${startDateFormatted} - ${endDateFormatted}</span>
                    </div>
                </div>
                ${campaign.website ? `
                    <div style="margin-top: 1rem;">
                        <a href="${campaign.website}" target="_blank" class="btn-action primary" style="display: block; text-align: center; text-decoration: none;">
                            Kunjungi Website
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Slide carousel to prev/next
function slideCarousel(direction) {
    const numSlides = campaigns.length; // Each campaign is a slide

    if (direction === 'next') {
        currentSlide = (currentSlide + 1) % numSlides;
    } else {
        currentSlide = (currentSlide - 1 + numSlides) % numSlides;
    }

    goToSlide(currentSlide);
}

// Go to specific slide
function goToSlide(slideIndex) {
    currentSlide = slideIndex;

    // Update transform - each card takes full container width
    if (carouselTrack) {
        // Since each card is min-width: 100%, we shift by full container width per slide
        // The gap is between cards, so we calculate: slideIndex * (100% of container + gap)
        const container = carouselTrack.parentElement;
        if (container && slideIndex > 0) {
            const containerWidth = container.offsetWidth;
            // Get gap value from CSS (--spacing-xl, typically 2rem = 32px)
            const computedStyle = window.getComputedStyle(carouselTrack);
            const gap = parseFloat(computedStyle.gap) || 32; // fallback to 32px

            // Calculate total offset: each slide = containerWidth + gap
            const offset = -slideIndex * (containerWidth + gap);
            carouselTrack.style.transform = `translateX(${offset}px)`;
        } else {
            carouselTrack.style.transform = 'translateX(0)';
        }
    }

    // Update indicators
    document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === slideIndex);
    });
}

// Auto-slide functionality
function startAutoSlide() {
    stopAutoSlide(); // Clear any existing interval

    autoSlideInterval = setInterval(() => {
        slideCarousel('next');
    }, 5000); // Slide every 5 seconds
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

function pauseAutoSlide() {
    stopAutoSlide();
}

// Update footer airdrop count
function updateFooterStats() {
    const footerTotalAirdrops = document.getElementById('footerTotalAirdrops');
    if (footerTotalAirdrops) {
        footerTotalAirdrops.textContent = airdrops.length;
    }
}
