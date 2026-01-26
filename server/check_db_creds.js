const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkCreds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        for (const u of users) {
            const k = u.integrations?.kaggle;
            if (k && k.username) {
                console.log(`User: ${u.username}`);
                console.log(`Kaggle Username: "${k.username}"`);
                const key = k.apiKey || '';
                console.log(`Kaggle Key Len: ${key.length}`);
                console.log(`Kaggle Key First 5: ${key.substring(0, 5)}`);
                console.log(`Kaggle Key Last 5: ${key.substring(key.length - 5)}`);
                console.log(`Kaggle Key (Raw Preview): ${key.substring(0, 20)}...`);
            }
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkCreds();
