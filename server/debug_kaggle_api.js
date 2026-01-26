const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/User');
require('dotenv').config();

const debugKaggleApi = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ 'integrations.kaggle.apiKey': { $exists: true, $ne: '' } });
        if (!user) {
            console.log('No user with Kaggle Key found.');
            process.exit();
        }

        const username = user.integrations.kaggle.username;
        let apiKey = user.integrations.kaggle.apiKey;

        console.log('--- CREDENTIAL DIAGNOSTICS ---');
        console.log(`DB Username: "${username}"`);
        console.log(`Raw API Key Length: ${apiKey.length}`);

        let finalKey = apiKey;

        // JSON Parsing Attempt
        if (apiKey.includes('{')) {
            console.log('Detected JSON format.');
            try {
                const json = JSON.parse(apiKey);
                console.log(`JSON Username: "${json.username}"`);
                console.log(`JSON Key Length: ${json.key ? json.key.length : 'MISSING'}`);
                if (json.key) finalKey = json.key;

                if (json.username && json.username !== username) {
                    console.warn(`[CRITICAL WRNING] DB username '${username}' does not match key file username '${json.username}'`);
                    console.warn('Overriding username for this test...');
                    // username = json.username; // Uncomment to test fix
                }
            } catch (e) { console.log('JSON Parse Failed:', e.message); }
        } else {
            console.log('Format: Raw String (Assumed Key)');
        }

        // Key Validation
        finalKey = finalKey.trim().replace(/['"]/g, '');
        console.log(`Final Key: "${finalKey.substring(0, 4)}...${finalKey.substring(finalKey.length - 4)}" (Length: ${finalKey.length})`);

        if (finalKey.length !== 32) {
            console.warn('[POTENTIAL ISSUE] Kaggle API Keys are typically 32 hex characters.');
        }

        const auth = { username, password: finalKey };

        // Test 1: Competitions
        try {
            console.log(`\nFetching Competitions for user '${username}'...`);
            const res1 = await axios.get(`https://www.kaggle.com/api/v1/competitions/list?user=${username}`, { auth });
            console.log(`SUCCESS. Count: ${res1.data.length}`);
        } catch (e) {
            console.error('Competitions Error Status:', e.response?.status);
            console.error('Competitions Error Data:', e.response?.data);
            console.error('Full Error:', e.message);
        }

        // Test 2: Kernels
        try {
            console.log('Fetching Kernels...');
            const res2 = await axios.get(`https://www.kaggle.com/api/v1/kernels/list?user=${username}`, { auth });
            console.log(`Query ?user=${username} Count: ${res2.data.length}`);
            if (res2.data.length > 0) console.log('Sample Kernel:', res2.data[0].title);
        } catch (e) {
            console.error('Kernels Error:', e.message);
        }

        process.exit();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

debugKaggleApi();
