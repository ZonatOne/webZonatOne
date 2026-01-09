// ===== State Management =====
let airdrops = [];
let campaigns = [];
let banners = []; // Banner ads state
let currentImageData = null;
let currentLogoData = null;
let currentBannerData = null;
let currentBannerImageData = null; // For banner ad image upload
let currentPage = 'home';
let currentFilter = 'all';
let searchQuery = '';
let editingId = null;
let editingCampaignId = null;
let editingBannerId = null; // For editing banner
let currentSlide = 0;
let currentBannerSlide = 0; // Current banner carousel slide
let autoSlideInterval = null;
let bannerAutoSlideInterval = null; // Banner carousel auto-slide timer

// ===== DOM Elements =====
const adminPanel = document.getElementById('adminPanel');
const openAdminBtn = document.getElementById('openAdminBtn');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const cancelBtn = document.getElementById('cancelBtn');
const airdropForm = document.getElementById('airdropForm');
const airdropsGrid = document.getElementById('airdropsGrid');
const searchInput = document.getElementById('searchInput');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

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
document.addEventListener('DOMContentLoaded', async () => {
    // Load data from Firestore (async)
    await loadAirdropsFromDB();
    await loadCampaignsFromDB();

    // Create samples if no data exists
    createSampleAirdrops();
    createSampleCampaigns();

    // Render UI
    renderAirdrops();
    renderCampaigns();
    renderCampaignCarousel();
    renderHeroCarousel();
    updateStats();
    setupEventListeners();
    startAutoSlide();
    startCountdownTimers();
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
            // Close mobile menu after selection
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

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

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderAirdrops();
        });
    }

    // Hero buttons
    const heroExploreBtn = document.getElementById('heroExploreBtn');
    const heroCreateBtn = document.getElementById('heroCreateBtn');

    if (heroExploreBtn) {
        heroExploreBtn.addEventListener('click', () => {
            document.querySelector('.airdrops-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (heroCreateBtn) {
        heroCreateBtn.addEventListener('click', openAdminPanel);
    }

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

    // Carousel controls
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');

    if (carouselPrev) {
        carouselPrev.addEventListener('click', () => {
            navigateCarousel(-1);
        });
    }

    if (carouselNext) {
        carouselNext.addEventListener('click', () => {
            navigateCarousel(1);
        });
    }
}

// ===== Stats Functions =====
function updateStats() {
    const total = airdrops.length;
    const active = airdrops.filter(a => {
        if (a.deadline === 'Ongoing') return true;
        return new Date(a.deadline) >= new Date();
    }).length;

    // Calculate total reward estimate
    let totalReward = 0;
    airdrops.forEach(a => {
        const match = a.reward.match(/\$?([\d,]+)/g);
        if (match) {
            const highest = Math.max(...match.map(m => parseInt(m.replace(/[$,]/g, '')) || 0));
            totalReward += highest;
        }
    });

    const formatReward = totalReward >= 1000 ? `$${Math.round(totalReward / 1000)}K+` : `$${totalReward}`;

    // Update all stats elements
    const statsElements = {
        'statTotalAirdrops': total,
        'statActiveAirdrops': active,
        'statTotalReward': formatReward,
        'dashTotalAirdrops': total,
        'dashActiveAirdrops': active,
        'dashTotalCampaigns': campaigns.length,
        'dashTotalReward': formatReward,
        'footerTotalAirdrops': total
    };

    Object.entries(statsElements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
            animateCounter(el, value);
        }
    });
}

function animateCounter(element, target) {
    if (typeof target === 'string') {
        element.textContent = target;
        return;
    }

    const duration = 1000;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            element.textContent = target;
        } else {
            element.textContent = Math.round(current);
            requestAnimationFrame(animate);
        }
    };

    animate();
}

// ===== Modal Functions =====
async function openAdminPanel() {
    // Check if admin wallet is connected
    if (!walletConnected) {
        showNotification('⚠️ Hubungkan wallet admin untuk membuat airdrop');
        const connected = await connectWallet();
        if (!connected) return;
    }

    if (!isAdmin) {
        showNotification('🔒 Hanya admin yang dapat membuat airdrop');
        return;
    }

    // Reset Form State
    editingId = null;
    if (airdropForm) airdropForm.reset();

    // Reset UI Text
    const titleEl = document.querySelector('#adminPanel .panel-header h3');
    const btnEl = document.querySelector('#adminPanel .btn-primary');
    if (titleEl) titleEl.textContent = 'Tambah Airdrop Baru';
    if (btnEl) btnEl.textContent = 'Publikasikan Airdrop';

    // Reset Image Uploader
    currentImageData = null;
    if (previewImg) previewImg.src = '';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
    if (imagePreview) imagePreview.style.display = 'none';

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
    document.querySelector('#adminPanel .panel-header h3').textContent = 'Buat Info Airdrop Baru';
    document.querySelector('#adminPanel .btn-primary').textContent = 'Publikasikan Airdrop';
}

// ===== Image Upload Functions =====
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

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
        network: document.getElementById('airdropNetwork').value,
        difficulty: document.getElementById('airdropDifficulty').value,
        steps: document.getElementById('airdropSteps').value,
        logo: currentImageData,
        createdAt: editingId ? airdrops.find(a => a.id === editingId).createdAt : new Date().toISOString()
    };


    if (editingId) {
        const index = airdrops.findIndex(a => a.id === editingId);
        if (index !== -1) {
            airdrops[index] = formData;
        }
        editingId = null;
    } else {
        airdrops.unshift(formData);
    }

    saveAirdrops();
    renderAirdrops();
    updateStats();
    closeAdminPanel();
    showNotification('Airdrop berhasil dipublikasikan! 🎉');
}

// ===== Navigation Functions =====
function switchPage(page) {
    currentPage = page;

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });

    const airdropsSection = document.querySelector('.airdrops-section');
    const heroSection = document.querySelector('.hero');
    const statsDashboard = document.querySelector('.stats-dashboard');
    const carouselSection = document.querySelector('.campaign-carousel-section');
    const campaignsSection = document.getElementById('campaignsSection');

    if (page === 'campaign') {
        if (airdropsSection) airdropsSection.style.display = 'none';
        if (heroSection) heroSection.style.display = 'none';
        if (statsDashboard) statsDashboard.style.display = 'none';
        if (carouselSection) carouselSection.style.display = 'none';
        if (campaignsSection) {
            campaignsSection.style.display = 'block';
            renderCampaigns();
        }
    } else if (page === 'home') {
        if (airdropsSection) airdropsSection.style.display = 'block';
        if (heroSection) heroSection.style.display = 'block';
        if (statsDashboard) statsDashboard.style.display = 'block';
        if (carouselSection) carouselSection.style.display = 'block';
        if (campaignsSection) campaignsSection.style.display = 'none';
    } else {
        showNotification(`Halaman ${page.charAt(0).toUpperCase() + page.slice(1)} sedang dalam pengembangan! 🚧`);
    }
}

// ===== Countdown Timer =====
function getCountdown(deadline) {
    if (deadline === 'Ongoing') return null;

    const now = new Date().getTime();
    const end = new Date(deadline).getTime();
    const diff = end - now;

    if (diff <= 0) return { expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
}

function startCountdownTimers() {
    setInterval(() => {
        document.querySelectorAll('.countdown-timer').forEach(timer => {
            const deadline = timer.dataset.deadline;
            const countdown = getCountdown(deadline);

            if (countdown && !countdown.expired) {
                timer.innerHTML = `
                    <div class="countdown-item">
                        <span class="countdown-value">${countdown.days}</span>
                        <span class="countdown-label">Hari</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">${countdown.hours}</span>
                        <span class="countdown-label">Jam</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">${countdown.minutes}</span>
                        <span class="countdown-label">Min</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">${countdown.seconds}</span>
                        <span class="countdown-label">Det</span>
                    </div>
                `;
            } else if (countdown && countdown.expired) {
                timer.innerHTML = '<div class="countdown-item"><span class="countdown-value" style="color: var(--danger-color);">Expired</span></div>';
            }
        });
    }, 1000);
}

// ===== Render Functions =====
function renderAirdrops() {
    let filteredAirdrops = airdrops;

    // Apply search filter
    if (searchQuery) {
        filteredAirdrops = filteredAirdrops.filter(a =>
            a.title.toLowerCase().includes(searchQuery) ||
            a.description.toLowerCase().includes(searchQuery) ||
            a.category.toLowerCase().includes(searchQuery) ||
            (a.network && a.network.toLowerCase().includes(searchQuery))
        );
    }

    // Apply category filters
    if (currentFilter === 'active') {
        filteredAirdrops = filteredAirdrops.filter(a => {
            if (a.deadline === 'Ongoing') return true;
            return new Date(a.deadline) >= new Date();
        });
    } else if (currentFilter === 'upcoming') {
        filteredAirdrops = filteredAirdrops.filter(a => {
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
                    ${searchQuery ? 'Tidak ada airdrop yang cocok dengan pencarian' : (airdrops.length === 0 ? 'Belum ada airdrop yang dipublikasikan' : 'Tidak ada airdrop yang sesuai filter')}
                </p>
                <p style="color: var(--text-secondary);">
                    ${searchQuery ? 'Coba kata kunci lain' : (airdrops.length === 0 ? 'Klik tombol "Buat Airdrop" untuk menambahkan info airdrop pertama' : 'Coba filter lain atau reset filter')}
                </p>
            </div>
        `;
        return;
    }

    airdropsGrid.innerHTML = filteredAirdrops.map(airdrop => createAirdropCard(airdrop)).join('');
}

function createAirdropCard(airdrop) {
    const logoHtml = airdrop.logo
        ? `<img src="${airdrop.logo}" alt="${airdrop.title}" class="card-logo">`
        : `<div class="card-logo-placeholder">${airdrop.title.charAt(0)}</div>`;

    const deadlineFormatted = airdrop.deadline !== 'Ongoing'
        ? new Date(airdrop.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Ongoing';

    const networkClass = airdrop.network ? airdrop.network.toLowerCase() : 'multichain';
    const difficultyClass = airdrop.difficulty ? airdrop.difficulty.toLowerCase() : 'medium';

    const countdown = getCountdown(airdrop.deadline);
    const countdownHtml = countdown && !countdown.expired ? `
        <div class="countdown-timer" data-deadline="${airdrop.deadline}">
            <div class="countdown-item">
                <span class="countdown-value">${countdown.days}</span>
                <span class="countdown-label">Hari</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${countdown.hours}</span>
                <span class="countdown-label">Jam</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${countdown.minutes}</span>
                <span class="countdown-label">Min</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">${countdown.seconds}</span>
                <span class="countdown-label">Det</span>
            </div>
        </div>
    ` : '';

    return `
        <div class="airdrop-card" data-id="${airdrop.id}">
            <div class="airdrop-card-inner">
                <div class="card-header">
                    ${logoHtml}
                    <div class="card-title-section">
                        <h4 class="card-title">${airdrop.title}</h4>
                        <span class="card-category">${airdrop.category}</span>
                        <span class="difficulty-badge ${difficultyClass}">${airdrop.difficulty || 'Medium'}</span>
                    </div>
                </div>
                <p class="card-description">${airdrop.description}</p>
                ${countdownHtml}
                <div class="card-info">
                    <div class="info-item">
                        <span class="info-label">Reward</span>
                        <span class="info-value">${airdrop.reward}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Deadline</span>
                        <span class="info-value">${deadlineFormatted}</span>
                    </div>
                    <div class="info-item network">
                        <span class="info-label">Network</span>
                        <span class="info-value network-value ${networkClass}">${airdrop.network || 'Multichain'}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-action" onclick="viewDetails(${airdrop.id})">Detail</button>
                    <button class="btn-action primary" onclick="joinAirdrop(${airdrop.id})">Ikuti Airdrop</button>
                </div>
                ${(typeof isAdmin !== 'undefined' && isAdmin) ? `
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;" class="admin-actions">
                    <button class="btn-action" onclick="editAirdrop(${airdrop.id})" style="flex: 1; font-size: 0.85rem; padding: 0.5rem;">✏️ Edit</button>
                    <button class="btn-action" onclick="deleteAirdrop(${airdrop.id})" style="flex: 1; font-size: 0.85rem; padding: 0.5rem; border-color: #ff6b9d; color: #ff6b9d;">🗑️ Hapus</button>
                </div>
                ` : ''}
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
                <div style="display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
                    ${airdrop.logo ? `<img src="${airdrop.logo}" style="width: 120px; height: 120px; border-radius: 16px; object-fit: cover;">` : ''}
                    <div>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                            <span class="card-category">${airdrop.category}</span>
                            <span class="network-badge ${(airdrop.network || 'multichain').toLowerCase()}" style="position: static;">${airdrop.network || 'Multichain'}</span>
                            <span class="difficulty-badge ${(airdrop.difficulty || 'medium').toLowerCase()}">${airdrop.difficulty || 'Medium'}</span>
                        </div>
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

// ===== Database Storage (Firebase Firestore) =====
async function saveAirdrops() {
    // Save to Firestore
    await saveAirdropsToFirestore(airdrops);
    // Also keep localStorage as backup
    localStorage.setItem('airdrops', JSON.stringify(airdrops));
}

async function loadAirdropsFromDB() {
    // Try to load from Firestore first
    const firestoreData = await loadAirdropsFromFirestore();
    if (firestoreData && firestoreData.length > 0) {
        airdrops = firestoreData;
    } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('airdrops');
        if (saved) {
            airdrops = JSON.parse(saved);
        }
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
        max-width: 300px;
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

// ===== Sample Data - 12 Airdrops =====
function createSampleAirdrops() {
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
            network: 'Multichain',
            difficulty: 'Medium',
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
            network: 'Ethereum',
            difficulty: 'Medium',
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
            network: 'Ethereum',
            difficulty: 'Hard',
            steps: '1. Bridge ke Starknet\n2. Deploy smart contract wallet\n3. Gunakan dApps (JediSwap, mySwap)\n4. Participate in governance\n5. Hold STRK tokens',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 4,
            title: 'Scroll Airdrop',
            description: 'Scroll adalah zkEVM Layer 2 yang kompatibel dengan Ethereum. Early adopters yang aktif menggunakan testnet dan mainnet berpotensi mendapat airdrop.',
            reward: '$300 - $1,500',
            deadline: '2026-04-15',
            website: 'https://scroll.io',
            category: 'Layer 2',
            network: 'Ethereum',
            difficulty: 'Easy',
            steps: '1. Bridge ETH ke Scroll\n2. Gunakan DEX seperti SyncSwap\n3. Mint NFT di ekosistem Scroll\n4. Interaksi dengan smart contracts\n5. Konsistensi penggunaan',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 5,
            title: 'Base Network Rewards',
            description: 'Base adalah Layer 2 dari Coinbase. Pengguna aktif yang berinteraksi dengan ekosistem Base berpotensi mendapatkan rewards dan airdrops.',
            reward: '$200 - $800',
            deadline: 'Ongoing',
            website: 'https://base.org',
            category: 'Layer 2',
            network: 'Ethereum',
            difficulty: 'Easy',
            steps: '1. Bridge ETH ke Base\n2. Swap di Uniswap atau Aerodrome\n3. Mint Onchain Summer NFTs\n4. Gunakan friend.tech\n5. Eksplorasi dApps baru',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 6,
            title: 'Linea Voyage Rewards',
            description: 'Linea adalah zkEVM Layer 2 dari ConsenSys. Program Voyage memberikan NFT dan potensi airdrop untuk pengguna aktif.',
            reward: '$400 - $2,000',
            deadline: '2026-05-20',
            website: 'https://linea.build',
            category: 'Layer 2',
            network: 'Ethereum',
            difficulty: 'Medium',
            steps: '1. Bridge ke Linea\n2. Complete Voyage quests\n3. Gunakan DEX dan lending protocols\n4. Kumpulkan XP points\n5. Claim Voyage NFTs',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 7,
            title: 'Eigenlayer Points',
            description: 'Eigenlayer adalah restaking protocol di Ethereum. Stake ETH atau LSTs untuk mengumpulkan points yang bisa dikonversi ke tokens.',
            reward: '$1,000 - $10,000',
            deadline: 'Ongoing',
            website: 'https://eigenlayer.xyz',
            category: 'DeFi',
            network: 'Ethereum',
            difficulty: 'Medium',
            steps: '1. Beli ETH atau LST (stETH, rETH)\n2. Kunjungi Eigenlayer app\n3. Restake tokens Anda\n4. Delegate ke operator\n5. Kumpulkan restaking points',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 8,
            title: 'Blast Big Bang',
            description: 'Blast adalah Layer 2 dengan native yield untuk ETH dan stablecoins. Program Big Bang memberikan points yang bisa ditukar dengan tokens.',
            reward: '$500 - $5,000',
            deadline: '2026-02-28',
            website: 'https://blast.io',
            category: 'Layer 2',
            network: 'Ethereum',
            difficulty: 'Easy',
            steps: '1. Bridge ETH ke Blast\n2. Hold ETH untuk auto-yield\n3. Gunakan dApps di ekosistem\n4. Invite friends untuk bonus\n5. Kumpulkan Blast Points',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 9,
            title: 'Jupiter Exchange Airdrop',
            description: 'Jupiter adalah DEX aggregator terbesar di Solana. Program rewards untuk active traders dan liquidity providers.',
            reward: '$100 - $1,000',
            deadline: 'Ongoing',
            website: 'https://jup.ag',
            category: 'DeFi',
            network: 'Solana',
            difficulty: 'Easy',
            steps: '1. Connect Solana wallet\n2. Trade secara regular\n3. Gunakan limit orders\n4. Stake JUP tokens\n5. Vote di governance',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 10,
            title: 'Magic Eden Rewards',
            description: 'Magic Eden adalah NFT marketplace terkemuka. Program rewards untuk collectors dan traders NFT aktif.',
            reward: '$50 - $500',
            deadline: '2026-04-01',
            website: 'https://magiceden.io',
            category: 'NFT',
            network: 'Multichain',
            difficulty: 'Easy',
            steps: '1. Connect wallet\n2. List dan trade NFTs\n3. Complete daily missions\n4. Collect Diamond rewards\n5. Participate in launches',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 11,
            title: 'Polymarket Trading Rewards',
            description: 'Polymarket adalah prediction market terbesar. Active traders berpotensi mendapat rewards dari trading activity.',
            reward: '$200 - $2,000',
            deadline: 'Ongoing',
            website: 'https://polymarket.com',
            category: 'DeFi',
            network: 'Polygon',
            difficulty: 'Medium',
            steps: '1. Deposit USDC ke Polymarket\n2. Trade prediction markets\n3. Provide liquidity\n4. Jaga win rate yang baik\n5. Trading volume konsisten',
            logo: null,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 12,
            title: 'Zora Network Rewards',
            description: 'Zora adalah NFT protocol dan network. Creators dan collectors aktif berpotensi mendapatkan rewards.',
            reward: '$100 - $800',
            deadline: '2026-05-15',
            website: 'https://zora.co',
            category: 'NFT',
            network: 'Ethereum',
            difficulty: 'Easy',
            steps: '1. Connect wallet ke Zora\n2. Mint dan collect NFTs\n3. Create original content\n4. Bridge ke Zora Network\n5. Engage dengan community',
            logo: null,
            createdAt: new Date().toISOString()
        }
    ];

    airdrops = samples;
    saveAirdrops();
}

// ===== Edit and Delete Functions =====
async function editAirdrop(id) {
    // Check if admin wallet is connected
    if (!walletConnected || !isAdmin) {
        showNotification('🔒 Hanya admin yang dapat mengedit airdrop');
        return;
    }

    const airdrop = airdrops.find(a => a.id === id);
    if (!airdrop) return;

    editingId = id;

    document.getElementById('airdropTitle').value = airdrop.title;
    document.getElementById('airdropDescription').value = airdrop.description;
    document.getElementById('airdropReward').value = airdrop.reward === 'TBA' ? '' : airdrop.reward;
    document.getElementById('airdropDeadline').value = airdrop.deadline === 'Ongoing' ? '' : airdrop.deadline;
    document.getElementById('airdropWebsite').value = airdrop.website || '';
    document.getElementById('airdropCategory').value = airdrop.category;
    document.getElementById('airdropNetwork').value = airdrop.network || 'Ethereum';
    document.getElementById('airdropDifficulty').value = airdrop.difficulty || 'Medium';
    document.getElementById('airdropSteps').value = airdrop.steps || '';

    if (airdrop.logo) {
        currentImageData = airdrop.logo;
        previewImg.src = currentImageData;
        uploadPlaceholder.style.display = 'none';
        imagePreview.style.display = 'block';
    }

    document.querySelector('#adminPanel .panel-header h3').textContent = 'Edit Info Airdrop';
    document.querySelector('#adminPanel .btn-primary').textContent = 'Update Airdrop';

    adminPanel.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function deleteAirdrop(id) {
    // Check if admin wallet is connected
    if (!walletConnected || !isAdmin) {
        showNotification('🔒 Hanya admin yang dapat menghapus airdrop');
        return;
    }

    if (!confirm('Yakin ingin menghapus airdrop ini?')) return;

    airdrops = airdrops.filter(a => a.id !== id);
    saveAirdrops();
    renderAirdrops();
    updateStats();
    showNotification('Airdrop berhasil dihapus! 🗑️');
}

// ===== Campaign Functions =====
async function openCampaignPanel() {
    // Check wallet connection first
    if (!walletConnected) {
        showNotification('⚠️ Hubungkan wallet Phantom terlebih dahulu untuk membuat Star Kampanye');
        // Try to connect wallet
        const connected = await connectWallet();
        if (!connected) return;
    }

    // Check if admin (free access) or needs payment
    if (!isAdmin) {
        showNotification('💳 Pembayaran diperlukan untuk membuat Star Kampanye ($57 / 0.4 SOL)');
        const paid = await payForCampaign();
        if (!paid) {
            showNotification('❌ Pembayaran dibatalkan. Tidak dapat membuat kampanye.');
            return;
        }
    }

    // Open the panel
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
    editingCampaignId = null;
}

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

function handleCampaignSubmit(e) {
    e.preventDefault();

    const formData = {
        id: editingCampaignId || Date.now(),
        name: document.getElementById('campaignName').value,
        description: document.getElementById('campaignDescription').value,
        website: document.getElementById('campaignWebsite').value,
        budget: document.getElementById('campaignBudget').value || 'TBA',
        startDate: document.getElementById('campaignStartDate').value || 'Sekarang',
        endDate: document.getElementById('campaignEndDate').value || 'Ongoing',
        logo: currentLogoData,
        banner: currentBannerData,
        isStar: editingCampaignId ? campaigns.find(c => c.id === editingCampaignId)?.isStar || true : true,
        createdAt: editingCampaignId ? campaigns.find(c => c.id === editingCampaignId).createdAt : new Date().toISOString()
    };

    if (editingCampaignId) {
        const index = campaigns.findIndex(c => c.id === editingCampaignId);
        if (index !== -1) {
            campaigns[index] = formData;
        }
        editingCampaignId = null;
    } else {
        campaigns.unshift(formData);
    }

    saveCampaigns();
    renderCampaigns();
    renderCampaignCarousel();
    updateStats();
    closeCampaignPanel();
    showNotification(editingCampaignId ? 'Kampanye berhasil diupdate! ✨' : 'Kampanye berhasil dipublikasikan! ⭐');
}

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
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn-action primary" onclick="visitCampaign(${campaign.id})" style="flex: 2;">Kunjungi</button>
                    ${(typeof isAdmin !== 'undefined' && isAdmin) ? `
                    <button class="btn-action" onclick="editCampaign(${campaign.id})" style="flex: 1;">✏️</button>
                    <button class="btn-action" onclick="deleteCampaign(${campaign.id})" style="flex: 1; border-color: #ff6b9d; color: #ff6b9d;">🗑️</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function visitCampaign(id) {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign && campaign.website) {
        window.open(campaign.website, '_blank');
    } else {
        showNotification('Website kampanye belum tersedia');
    }
}

function editCampaign(id) {
    // Check if admin wallet is connected
    if (!walletConnected || !isAdmin) {
        showNotification('🔒 Hanya admin yang dapat mengedit kampanye');
        return;
    }

    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    editingCampaignId = id;

    document.getElementById('campaignName').value = campaign.name;
    document.getElementById('campaignDescription').value = campaign.description;
    document.getElementById('campaignWebsite').value = campaign.website || '';
    document.getElementById('campaignBudget').value = campaign.budget === 'TBA' ? '' : campaign.budget;
    document.getElementById('campaignStartDate').value = campaign.startDate === 'Sekarang' ? '' : campaign.startDate;
    document.getElementById('campaignEndDate').value = campaign.endDate === 'Ongoing' ? '' : campaign.endDate;

    if (campaign.logo) {
        currentLogoData = campaign.logo;
        logoPreviewImg.src = currentLogoData;
        uploadLogoPlaceholder.style.display = 'none';
        logoPreview.style.display = 'block';
    }

    if (campaign.banner) {
        currentBannerData = campaign.banner;
        bannerPreviewImg.src = currentBannerData;
        uploadBannerPlaceholder.style.display = 'none';
        bannerPreview.style.display = 'block';
    }

    document.querySelector('#campaignPanel .panel-header h3').textContent = 'Edit Kampanye';
    document.querySelector('#campaignPanel .btn-primary').textContent = 'Update Kampanye';

    // Open panel directly (already checked admin)
    if (campaignPanel) {
        campaignPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function deleteCampaign(id) {
    // Check if admin wallet is connected
    if (!walletConnected || !isAdmin) {
        showNotification('🔒 Hanya admin yang dapat menghapus kampanye');
        return;
    }

    if (!confirm('Yakin ingin menghapus kampanye ini?')) return;

    campaigns = campaigns.filter(c => c.id !== id);
    saveCampaigns();
    renderCampaigns();
    renderCampaignCarousel();
    updateStats();
    showNotification('Kampanye berhasil dihapus! 🗑️');
}

async function saveCampaigns() {
    // Save to Firestore
    await saveCampaignsToFirestore(campaigns);
    // Also keep localStorage as backup
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
}

async function loadCampaignsFromDB() {
    // Try to load from Firestore first
    const firestoreData = await loadCampaignsFromFirestore();
    if (firestoreData && firestoreData.length > 0) {
        campaigns = firestoreData;
    } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('campaigns');
        if (saved) {
            campaigns = JSON.parse(saved);
        }
    }
}

// ===== Sample Campaigns - 6 Campaigns =====
function createSampleCampaigns() {
    if (campaigns.length > 0) return;

    const samples = [
        {
            id: Date.now() + 100,
            name: 'Polygon zkEVM Campaign',
            description: 'Kampanye resmi dari Polygon untuk adopsi zkEVM. Dapatkan rewards dengan berinteraksi di ekosistem Polygon zkEVM.',
            website: 'https://polygon.technology',
            budget: '$50,000',
            startDate: '2026-01-01',
            endDate: '2026-06-30',
            logo: null,
            banner: null,
            isStar: true,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 101,
            name: 'Arbitrum Odyssey',
            description: 'Program rewards untuk pengguna aktif Arbitrum. Complete quests dan earn NFTs serta token rewards.',
            website: 'https://arbitrum.io',
            budget: '$100,000',
            startDate: '2026-01-15',
            endDate: '2026-04-15',
            logo: null,
            banner: null,
            isStar: true,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 102,
            name: 'Optimism RetroPGF',
            description: 'Retroactive Public Goods Funding dari Optimism. Kontribusi ke ekosistem dan dapatkan rewards.',
            website: 'https://optimism.io',
            budget: '$200,000',
            startDate: 'Sekarang',
            endDate: 'Ongoing',
            logo: null,
            banner: null,
            isStar: true,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 103,
            name: 'Mantle Journey',
            description: 'Program incentive dari Mantle Network untuk early adopters. Bridge dan gunakan dApps untuk earn rewards.',
            website: 'https://mantle.xyz',
            budget: '$30,000',
            startDate: '2026-02-01',
            endDate: '2026-05-01',
            logo: null,
            banner: null,
            isStar: true,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 104,
            name: 'Mode Network Airdrop',
            description: 'Mode adalah Layer 2 dengan focus DeFi. Early users berpotensi mendapat MODE token airdrop.',
            website: 'https://mode.network',
            budget: '$25,000',
            startDate: '2026-01-10',
            endDate: '2026-03-31',
            logo: null,
            banner: null,
            isStar: true,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 105,
            name: 'Manta Pacific Campaign',
            description: 'Manta Pacific adalah modular L2 untuk ZK applications. Stake dan earn rewards dari New Paradigm.',
            website: 'https://manta.network',
            budget: '$40,000',
            startDate: 'Sekarang',
            endDate: '2026-04-30',
            logo: null,
            banner: null,
            isStar: true,
            createdAt: new Date().toISOString()
        }
    ];

    campaigns = samples;
    saveCampaigns();
}

// ===== Carousel Functions =====
function renderCampaignCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const carouselContainer = document.querySelector('.carousel-container');

    if (!carouselTrack || !carouselIndicators || !carouselContainer) return;

    const starCampaigns = campaigns.filter(c => c.isStar);

    if (starCampaigns.length === 0) {
        carouselTrack.innerHTML = `
            <div style="width: 100%; text-align: center; padding: 4rem;">
                <p style="color: var(--text-muted);">Belum ada Star Kampanye</p>
            </div>
        `;
        carouselIndicators.innerHTML = '';
        return;
    }

    carouselTrack.innerHTML = starCampaigns.map(campaign => createCampaignCard(campaign)).join('');

    carouselIndicators.innerHTML = starCampaigns.map((_, index) => `
        <button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
    `).join('');

    // Add click handlers for indicators
    carouselIndicators.querySelectorAll('.carousel-indicator').forEach(indicator => {
        indicator.addEventListener('click', () => {
            const index = parseInt(indicator.dataset.index);
            goToSlide(index);
        });
    });

    currentSlide = 0;
    updateCarouselPosition();
}

function navigateCarousel(direction) {
    const starCampaigns = campaigns.filter(c => c.isStar);
    if (starCampaigns.length === 0) return;

    currentSlide += direction;

    if (currentSlide < 0) {
        currentSlide = starCampaigns.length - 1;
    } else if (currentSlide >= starCampaigns.length) {
        currentSlide = 0;
    }

    updateCarouselPosition();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const carouselContainer = document.querySelector('.carousel-container');

    if (!carouselTrack || !carouselContainer) return;

    // Use pixel-based translation for accurate positioning
    const containerWidth = carouselContainer.offsetWidth;
    const translateValue = currentSlide * containerWidth;
    carouselTrack.style.transform = `translateX(-${translateValue}px)`;

    if (carouselIndicators) {
        carouselIndicators.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
}

function startAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }

    autoSlideInterval = setInterval(() => {
        navigateCarousel(1);
        navigateHeroCarousel(1);
    }, 5000);
}

// Recalculate carousel position on window resize
window.addEventListener('resize', () => {
    updateCarouselPosition();
    updateHeroCarouselPosition();
});

// ===== Hero Carousel Functions =====
let heroCurrentSlide = 0;

function renderHeroCarousel() {
    const heroTrack = document.getElementById('heroCarouselTrack');
    const heroDots = document.getElementById('heroCarouselDots');
    const heroPrev = document.getElementById('heroPrev');
    const heroNext = document.getElementById('heroNext');

    if (!heroTrack || !heroDots) return;

    const starCampaigns = campaigns.filter(c => c.isStar);

    if (starCampaigns.length === 0) {
        heroTrack.innerHTML = `
            <div class="hero-campaign-card">
                <div class="campaign-banner-placeholder">✨</div>
                <div class="campaign-info-row">
                    <div class="campaign-logo-placeholder">?</div>
                    <h4 class="campaign-name">Star Kampanye Pilihan</h4>
                </div>
                <p class="campaign-desc">Belum ada kampanye premium. Jadilah yang pertama!</p>
                <div class="campaign-cta">
                    <button class="btn-cta primary" onclick="document.getElementById('openCampaignBtn').click()">Buat Kampanye</button>
                </div>
            </div>
        `;
        heroDots.innerHTML = '';
        return;
    }

    heroTrack.innerHTML = starCampaigns.map(campaign => createHeroCampaignCard(campaign)).join('');

    heroDots.innerHTML = starCampaigns.map((_, index) => `
        <div class="hero-carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');

    // Add click handlers for dots
    heroDots.querySelectorAll('.hero-carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            heroCurrentSlide = parseInt(dot.dataset.index);
            updateHeroCarouselPosition();
        });
    });

    // Add click handlers for nav buttons
    if (heroPrev) {
        heroPrev.addEventListener('click', () => navigateHeroCarousel(-1));
    }
    if (heroNext) {
        heroNext.addEventListener('click', () => navigateHeroCarousel(1));
    }

    heroCurrentSlide = 0;
    updateHeroCarouselPosition();
}

function createHeroCampaignCard(campaign) {
    return `
        <div class="hero-campaign-card">
            ${campaign.banner
            ? `<img src="${campaign.banner}" alt="${campaign.name}" class="campaign-banner">`
            : `<div class="campaign-banner-placeholder">✨</div>`
        }
            <div class="campaign-info-row">
                ${campaign.logo
            ? `<img src="${campaign.logo}" alt="${campaign.name}" class="campaign-logo">`
            : `<div class="campaign-logo-placeholder">${campaign.name.charAt(0)}</div>`
        }
                <h4 class="campaign-name">${campaign.name}</h4>
            </div>
            <p class="campaign-desc">${campaign.description}</p>
            <div class="campaign-cta">
                <button class="btn-cta primary" onclick="visitCampaign(${campaign.id})">Kunjungi</button>
                <button class="btn-cta secondary" onclick="viewCampaignDetails(${campaign.id})">Detail</button>
            </div>
        </div>
    `;
}

function navigateHeroCarousel(direction) {
    const starCampaigns = campaigns.filter(c => c.isStar);
    if (starCampaigns.length === 0) return;

    heroCurrentSlide += direction;

    if (heroCurrentSlide < 0) {
        heroCurrentSlide = starCampaigns.length - 1;
    } else if (heroCurrentSlide >= starCampaigns.length) {
        heroCurrentSlide = 0;
    }

    updateHeroCarouselPosition();
}

function updateHeroCarouselPosition() {
    const heroTrack = document.getElementById('heroCarouselTrack');
    const heroDots = document.getElementById('heroCarouselDots');
    const heroContainer = document.querySelector('.hero-carousel-container');

    if (!heroTrack || !heroContainer) return;

    const containerWidth = heroContainer.offsetWidth;
    heroTrack.style.transform = `translateX(-${heroCurrentSlide * containerWidth}px)`;

    if (heroDots) {
        heroDots.querySelectorAll('.hero-carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === heroCurrentSlide);
        });
    }
}

function viewCampaignDetails(id) {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="admin-panel" style="max-width: 600px;">
            <div class="panel-header">
                <h3>${campaign.name}</h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                ${campaign.banner ? `<img src="${campaign.banner}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem;">` : ''}
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${campaign.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div style="padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Budget</div>
                        <div style="font-weight: 600;">${campaign.budget || 'TBA'}</div>
                    </div>
                    <div style="padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Periode</div>
                        <div style="font-weight: 600;">${campaign.startDate || 'TBA'} - ${campaign.endDate || 'TBA'}</div>
                    </div>
                </div>
                ${campaign.website ? `<a href="${campaign.website}" target="_blank" class="btn-action primary" style="display: block; text-align: center; margin-top: 1rem;">Kunjungi Website</a>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ===== Crypto Price Ticker =====
const CRYPTO_COINS = [
    { id: 'bitcoin', symbol: 'BTC' },
    { id: 'ethereum', symbol: 'ETH' },
    { id: 'solana', symbol: 'SOL' },
    { id: 'binancecoin', symbol: 'BNB' },
    { id: 'cardano', symbol: 'ADA' },
    { id: 'dogecoin', symbol: 'DOGE' },
    { id: 'chainlink', symbol: 'LINK' },
    { id: 'litecoin', symbol: 'LTC' },
    { id: 'polkadot', symbol: 'DOT' },
    { id: 'avalanche-2', symbol: 'AVAX' }
];

async function fetchCryptoPrices() {
    try {
        const ids = CRYPTO_COINS.map(c => c.id).join(',');
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch crypto prices:', error);
        return null;
    }
}

function formatPrice(price) {
    if (price >= 1000) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
        return price.toFixed(2);
    } else {
        return price.toFixed(4);
    }
}

function renderCryptoTicker(prices) {
    const tickerTrack = document.getElementById('tickerTrack');
    if (!tickerTrack) return;

    if (!prices) {
        tickerTrack.innerHTML = `
            <div class="ticker-content">
                <span class="ticker-item">⚠️ Gagal memuat harga crypto</span>
            </div>
        `;
        return;
    }

    let tickerHTML = '';

    CRYPTO_COINS.forEach(coin => {
        const coinData = prices[coin.id];
        if (coinData) {
            const price = coinData.usd;
            const change = coinData.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSign = change >= 0 ? '+' : '';

            tickerHTML += `
                <span class="ticker-item">
                    <span class="ticker-symbol">${coin.symbol}</span>
                    <span class="ticker-price">$${formatPrice(price)}</span>
                    <span class="ticker-change ${changeClass}">${changeSign}${change.toFixed(2)}%</span>
                </span>
            `;
        }
    });

    // Duplicate content for seamless infinite scroll
    tickerTrack.innerHTML = `
        <div class="ticker-content">${tickerHTML}</div>
        <div class="ticker-content">${tickerHTML}</div>
    `;
}

async function initCryptoTicker() {
    const prices = await fetchCryptoPrices();
    renderCryptoTicker(prices);

    // Auto-refresh every 60 seconds
    setInterval(async () => {
        const newPrices = await fetchCryptoPrices();
        if (newPrices) {
            renderCryptoTicker(newPrices);
        }
    }, 60000);
}

// Initialize ticker on page load
document.addEventListener('DOMContentLoaded', () => {
    initCryptoTicker();
});
