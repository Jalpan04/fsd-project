const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testKaggleLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ 'integrations.kaggle.apiKey': { $exists: true } });

        let apiKey = user.integrations.kaggle.apiKey;
        const username = user.integrations.kaggle.username;
        let jsonUsername = null;

        console.log(`Original DB Username: ${username}`);
        console.log(`Original DB Key: ${apiKey}`);

        // --- LOGIC FROM aggregatorService.js ---
        if (apiKey) {
            apiKey = apiKey.trim();
            if (apiKey.includes('"key":') || apiKey.includes("'key':")) {
                try {
                    const json = JSON.parse(apiKey);
                    if (json.key) apiKey = json.key;
                    if (json.username) jsonUsername = json.username;
                } catch (e) {
                    const matchKey = apiKey.match(/['"]?key['"]?\s*[:=]\s*['"]?([a-f0-9]{32})['"]?/i);
                    if (matchKey && matchKey[1]) apiKey = matchKey[1];
                    const matchUser = apiKey.match(/['"]?username['"]?\s*[:=]\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
                    if (matchUser && matchUser[1]) jsonUsername = matchUser[1];
                }
            } else {
                apiKey = apiKey.replace(/['"\s]/g, '').trim();
            }

            if (jsonUsername && jsonUsername.toLowerCase() !== username.toLowerCase()) {
                console.log(`[Auto-Correct] Would update username to: ${jsonUsername}`);
            }
        }
        // ---------------------------------------

        console.log(`Final Processed Key: ${apiKey}`);
        console.log(`Final Processed Username: ${jsonUsername || username}`);

        const finalUser = (jsonUsername || username).trim();
        console.log(`Using Username: "${finalUser}"`);
        console.log(`Using Key: "${apiKey}" (Length: ${apiKey.length})`);

        const authHeader = 'Basic ' + Buffer.from(`${finalUser}:${apiKey}`).toString('base64');
        console.log(`Generated Auth Header: ${authHeader}`);

        console.log('Attempting Request...');
        try {
            const res = await axios.get(`https://www.kaggle.com/api/v1/competitions/list?group=entered`, {
                headers: { 'Authorization': authHeader }
            });
            console.log(`SUCCESS! Status: ${res.status}, Count: ${res.data.length}`);
        } catch (e) {
            console.log(`FAILED! Status: ${e.response?.status}`);
            console.log(`Data:`, e.response?.data);
            console.log(`Stack:`, e.message);
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testKaggleLogic();
