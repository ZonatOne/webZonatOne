// Firebase Configuration for ZonatOne
// Using Firebase v9+ modular SDK loaded via CDN (compat mode for simplicity)

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmLNQ5h2SH3kXQzTXKtJ0pSozy5CTEoxY",
    authDomain: "zonatone-ee1bf.firebaseapp.com",
    projectId: "zonatone-ee1bf",
    storageBucket: "zonatone-ee1bf.firebasestorage.app",
    messagingSenderId: "1032167973002",
    appId: "1:1032167973002:web:1d2ab19a128dcf695a8d73"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// ===== Firestore Helper Functions =====

// Save airdrops to Firestore
async function saveAirdropsToFirestore(airdrops) {
    try {
        const batch = db.batch();

        // Clear existing airdrops first (optional - for full sync)
        // For now, we'll just update/add

        for (const airdrop of airdrops) {
            const docRef = db.collection('airdrops').doc(airdrop.id.toString());
            batch.set(docRef, {
                ...airdrop,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
        console.log('✅ Airdrops saved to Firestore');
        return true;
    } catch (error) {
        console.error('❌ Error saving airdrops:', error);
        return false;
    }
}

// Load airdrops from Firestore
async function loadAirdropsFromFirestore() {
    try {
        const snapshot = await db.collection('airdrops')
            .orderBy('createdAt', 'desc')
            .get();

        const airdrops = [];
        snapshot.forEach(doc => {
            airdrops.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Loaded ${airdrops.length} airdrops from Firestore`);
        return airdrops;
    } catch (error) {
        console.error('❌ Error loading airdrops:', error);
        return [];
    }
}

// Save campaigns to Firestore
async function saveCampaignsToFirestore(campaigns) {
    try {
        const batch = db.batch();

        for (const campaign of campaigns) {
            const docRef = db.collection('campaigns').doc(campaign.id.toString());
            batch.set(docRef, {
                ...campaign,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
        console.log('✅ Campaigns saved to Firestore');
        return true;
    } catch (error) {
        console.error('❌ Error saving campaigns:', error);
        return false;
    }
}

// Load campaigns from Firestore
async function loadCampaignsFromFirestore() {
    try {
        const snapshot = await db.collection('campaigns')
            .orderBy('createdAt', 'desc')
            .get();

        const campaigns = [];
        snapshot.forEach(doc => {
            campaigns.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Loaded ${campaigns.length} campaigns from Firestore`);
        return campaigns;
    } catch (error) {
        console.error('❌ Error loading campaigns:', error);
        return [];
    }
}

// Add single airdrop
async function addAirdropToFirestore(airdrop) {
    try {
        const docRef = await db.collection('airdrops').add({
            ...airdrop,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Airdrop added with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding airdrop:', error);
        return null;
    }
}

// Add single campaign
async function addCampaignToFirestore(campaign) {
    try {
        const docRef = await db.collection('campaigns').add({
            ...campaign,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Campaign added with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding campaign:', error);
        return null;
    }
}

// Delete airdrop from Firestore
async function deleteAirdropFromFirestore(airdropId) {
    try {
        await db.collection('airdrops').doc(airdropId.toString()).delete();
        console.log('✅ Airdrop deleted:', airdropId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting airdrop:', error);
        return false;
    }
}

// Delete campaign from Firestore
async function deleteCampaignFromFirestore(campaignId) {
    try {
        await db.collection('campaigns').doc(campaignId.toString()).delete();
        console.log('✅ Campaign deleted:', campaignId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting campaign:', error);
        return false;
    }
}

// Update airdrop in Firestore
async function updateAirdropInFirestore(airdropId, data) {
    try {
        await db.collection('airdrops').doc(airdropId.toString()).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Airdrop updated:', airdropId);
        return true;
    } catch (error) {
        console.error('❌ Error updating airdrop:', error);
        return false;
    }
}

// Update campaign in Firestore
async function updateCampaignInFirestore(campaignId, data) {
    try {
        await db.collection('campaigns').doc(campaignId.toString()).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Campaign updated:', campaignId);
        return true;
    } catch (error) {
        console.error('❌ Error updating campaign:', error);
        return false;
    }
}

console.log('🔥 Firebase initialized for ZonatOne');
