// ===== Banner Ad Carousel Functionality =====

// DOM Elements for Banner Carousel
const bannerCarousel = document.getElementById('bannerCarousel');
const bannerTrack = document.getElementById('bannerTrack');
const bannerPrev = document.getElementById('bannerPrev');
const bannerNext = document.getElementById('bannerNext');
const bannerIndicators = document.getElementById('bannerIndicators');

// Banner Management Panel Elements
const bannerManagementPanel = document.getElementById('bannerManagementPanel');
const manageBannersBtn = document.getElementById('manageBannersBtn');
const closeBannerManagementBtn = document.getElementById('closeBannerManagementBtn');
const cancelBannerBtn = document.getElementById('cancelBannerBtn');
const bannerForm = document.getElementById('bannerForm');
const existingBannersList = document.getElementById('existingBannersList');

// Banner Upload Elements  
const uploadBannerAdArea = document.getElementById('uploadBannerAdArea');
const bannerAdImageUpload = document.getElementById('bannerAdImageUpload');
const uploadBannerAdPlaceholder = document.getElementById('uploadBannerAdPlaceholder');
const bannerAdPreview = document.getElementById('bannerAdPreview');
const bannerAdPreviewImg = document.getElementById('bannerAdPreviewImg');
const removeBannerAdBtn = document.getElementById('removeBannerAdBtn');

// Initialize Banner Carousel
function initBannerCarousel() {
    // Load banners from Firebase
    loadBannersFromDB();

    // Setup event listeners
    if (bannerPrev) {
        bannerPrev.addEventListener('click', () => navigateBanner(-1));
    }

    if (bannerNext) {
        bannerNext.addEventListener('click', () => navigateBanner(1));
    }

    // Banner management panel
    if (manageBannersBtn) {
        manageBannersBtn.addEventListener('click', openBannerManagementPanel);
    }

    if (closeBannerManagementBtn) {
        closeBannerManagementBtn.addEventListener('click', closeBannerManagementPanel);
    }

    if (cancelBannerBtn) {
        cancelBannerBtn.addEventListener('click', closeBannerManagementPanel);
    }

    if (bannerForm) {
        bannerForm.addEventListener('submit', handleBannerSubmit);
    }

    // Banner upload
    if (uploadBannerAdArea) {
        uploadBannerAdArea.addEventListener('click', () => bannerAdImageUpload.click());
    }

    if (bannerAdImageUpload) {
        bannerAdImageUpload.addEventListener('change', handleBannerAdImageUpload);
    }

    if (removeBannerAdBtn) {
        removeBannerAdBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearBannerAdImage();
        });
    }

    // Close modal when clicking outside
    if (bannerManagementPanel) {
        bannerManagementPanel.addEventListener('click', (e) => {
            if (e.target === bannerManagementPanel) {
                closeBannerManagementPanel();
            }
        });
    }

    // Start auto-rotation
    startBannerAutoSlide();
}

// Navigate Banner Carousel
function navigateBanner(direction) {
    if (banners.length === 0) return;

    currentBannerSlide = (currentBannerSlide + direction + banners.length) % banners.length;
    updateBannerCarousel();
}

// Update Banner Carousel Display
function updateBannerCarousel() {
    if (!bannerTrack) return;

    const offset = -currentBannerSlide * 100;
    bannerTrack.style.transform = `translateX(${offset}%)`;

    // Update indicators
    updateBannerIndicators();
}

// Update Banner Indicators
function updateBannerIndicators() {
    if (!bannerIndicators) return;

    const dots = bannerIndicators.querySelectorAll('.banner-dot');
    dots.forEach((dot, index) => {
        if (index === currentBannerSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Start Auto-Slide for Banner
function startBannerAutoSlide() {
    if (bannerAutoSlideInterval) {
        clearInterval(bannerAutoSlideInterval);
    }

    bannerAutoSlideInterval = setInterval(() => {
        if (banners.length > 1) {
            navigateBanner(1);
        }
    }, 5000); // Change banner every 5 seconds
}

// Render Banner Carousel
function renderBannerCarousel() {
    if (!bannerTrack || !bannerIndicators) return;

    if (banners.length === 0) {
        // Show placeholder
        bannerTrack.innerHTML = `
            <div class="banner-slide">
                <a href="#" class="banner-link" onclick="event.preventDefault();">
                    <div class="banner-placeholder">
                        <span>📢 Advertisement Space Available</span>
                    </div>
                </a>
            </div>
        `;
        bannerIndicators.innerHTML = '<span class="banner-dot active" data-index="0"></span>';
        return;
    }

    // Render banner slides
    bannerTrack.innerHTML = banners.map((banner, index) => `
        <div class="banner-slide">
            <a href="${banner.linkUrl}" target="_blank" class="banner-link" onclick="trackBannerClick('${banner.id}')">
                <img src="${banner.imageUrl}" alt="${banner.title}">
            </a>
        </div>
    `).join('');

    // Render indicators
    bannerIndicators.innerHTML = banners.map((banner, index) => `
        <span class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}" onclick="goToBannerSlide(${index})"></span>
    `).join('');

    currentBannerSlide = 0;
    updateBannerCarousel();
}

// Go to specific banner slide
function goToBannerSlide(index) {
    currentBannerSlide = index;
    updateBannerCarousel();

    // Reset auto-slide timer
    startBannerAutoSlide();
}

// Track Banner Click Analytics
function trackBannerClick(bannerId) {
    console.log('Banner clicked:', bannerId);
    // You can add analytics tracking here
    // For example, save click data to Firebase
}

// Open Banner Management Panel
async function openBannerManagementPanel() {
    // Check if admin
    if (!walletConnected) {
        showNotification('⚠️ Hubungkan wallet admin untuk kelola banner');
        const connected = await connectWallet();
        if (!connected) return;
    }

    if (!isAdmin) {
        showNotification('🔒 Hanya admin yang dapat mengelola banner');
        return;
    }

    // Reset form
    editingBannerId = null;
    if (bannerForm) bannerForm.reset();
    clearBannerAdImage();

    // Load existing banners
    renderExistingBanners();

    bannerManagementPanel.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Banner Management Panel
function closeBannerManagementPanel() {
    bannerManagementPanel.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (bannerForm) bannerForm.reset();
    clearBannerAdImage();
    editingBannerId = null;
}

// Handle Banner Ad Image Upload
function handleBannerAdImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('⚠️ Please upload an image file');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('⚠️ File size must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentBannerImageData = e.target.result;
        bannerAdPreviewImg.src = currentBannerImageData;
        uploadBannerAdPlaceholder.style.display = 'none';
        bannerAdPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Clear Banner Ad Image
function clearBannerAdImage() {
    currentBannerImageData = null;
    if (bannerAdImageUpload) bannerAdImageUpload.value = '';
    if (bannerAdPreviewImg) bannerAdPreviewImg.src = '';
    if (uploadBannerAdPlaceholder) uploadBannerAdPlaceholder.style.display = 'flex';
    if (bannerAdPreview) bannerAdPreview.style.display = 'none';
}

// Handle Banner Form Submit
async function handleBannerSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('bannerTitle').value;
    const linkUrl = document.getElementById('bannerLink').value;

    if (!currentBannerImageData && !editingBannerId) {
        showNotification('⚠️ Please upload a banner image');
        return;
    }

    const bannerData = {
        id: editingBannerId || `banner_${Date.now()}`,
        title: title,
        linkUrl: linkUrl,
        imageUrl: currentBannerImageData || (editingBannerId ? banners.find(b => b.id === editingBannerId).imageUrl : ''),
        createdAt: editingBannerId ? banners.find(b => b.id === editingBannerId).createdAt : new Date().toISOString(),
        createdBy: walletAddress,
        isActive: true
    };

    if (editingBannerId) {
        // Update existing banner
        const index = banners.findIndex(b => b.id === editingBannerId);
        if (index !== -1) {
            banners[index] = bannerData;
        }
    } else {
        // Add new banner
        banners.push(bannerData);
    }

    // Save to Firebase
    await saveBanners();

    // Re-render
    renderBannerCarousel();
    renderExistingBanners();

    // Reset form
    bannerForm.reset();
    clearBannerAdImage();
    editingBannerId = null;

    showNotification(editingBannerId ? '✅ Banner berhasil diupdate!' : '✅ Banner berhasil ditambahkan!');
}

// Render Existing Banners List
function renderExistingBanners() {
    if (!existingBannersList) return;

    if (banners.length === 0) {
        existingBannersList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Tidak ada banner aktif</p>';
        return;
    }

    existingBannersList.innerHTML = banners.map(banner => `
        <div class="banner-item-card">
            <div class="banner-item-preview">
                <img src="${banner.imageUrl}" alt="${banner.title}">
            </div>
            <div class="banner-item-info">
                <div class="banner-item-title">${banner.title}</div>
                <a href="${banner.linkUrl}" target="_blank" class="banner-item-link">${banner.linkUrl}</a>
            </div>
            <div class="banner-item-actions">
                <button class="btn-banner-edit" onclick="editBanner('${banner.id}')">Edit</button>
                <button class="btn-banner-delete" onclick="deleteBanner('${banner.id}')">Hapus</button>
            </div>
        </div>
    `).join('');
}

// Edit Banner
function editBanner(bannerId) {
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;

    editingBannerId = bannerId;

    // Fill form
    document.getElementById('bannerTitle').value = banner.title;
    document.getElementById('bannerLink').value = banner.linkUrl;

    // Show image preview
    currentBannerImageData = banner.imageUrl;
    bannerAdPreviewImg.src = banner.imageUrl;
    uploadBannerAdPlaceholder.style.display = 'none';
    bannerAdPreview.style.display = 'block';

    // Scroll to form
    bannerForm.scrollIntoView({ behavior: 'smooth' });

    showNotification('✏️ Edit banner');
}

// Delete Banner
async function deleteBanner(bannerId) {
    if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;

    banners = banners.filter(b => b.id !== bannerId);

    // Save to Firebase
    await saveBanners();

    // Re-render
    renderBannerCarousel();
    renderExistingBanners();

    showNotification('🗑️ Banner berhasil dihapus');
}

// Save Banners to Firebase
async function saveBanners() {
    try {
        // Save to Firestore (implement in firebase-config.js)
        if (typeof saveBannersToFirestore === 'function') {
            await saveBannersToFirestore(banners);
        }
        // Also save to localStorage as backup
        localStorage.setItem('banners', JSON.stringify(banners));
        return true;
    } catch (error) {
        console.error('Error saving banners:', error);
        showNotification('⚠️ Error saving banners');
        return false;
    }
}

// Load Banners from Firebase
async function loadBannersFromDB() {
    try {
        // Try Firestore first
        if (typeof loadBannersFromFirestore === 'function') {
            const firestoreData = await loadBannersFromFirestore();
            if (firestoreData && firestoreData.length > 0) {
                banners = firestoreData;
                renderBannerCarousel();
                return;
            }
        }

        // Fallback to localStorage
        const saved = localStorage.getItem('banners');
        if (saved) {
            banners = JSON.parse(saved);
        }

        renderBannerCarousel();
    } catch (error) {
        console.error('Error loading banners:', error);
        renderBannerCarousel();
    }
}

// Show/Hide Manage Banners button for admin
function updateBannerAdminUI() {
    if (manageBannersBtn) {
        manageBannersBtn.style.display = isAdmin ? 'flex' : 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initBannerCarousel();
});
