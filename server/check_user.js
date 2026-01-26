const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        users.forEach(u => {
            console.log(`User: ${u.username} (${u._id})`);
            console.log('Integrations:', JSON.stringify(u.integrations, null, 2));
            console.log('---');
        });

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkUser();
