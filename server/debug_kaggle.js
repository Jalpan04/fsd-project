const axios = require('axios');

const debugKaggle = async (username) => {
    console.log(`[Debug] Testing Kaggle scraping for: ${username}`);
    try {
        const response = await axios.get(`https://www.kaggle.com/${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Try minimal headers
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });

        console.log(`[Debug] Status Code: ${response.status}`);
        console.log(`[Debug] HTML Length: ${response.data.length}`);
        console.log(`[Debug] Content:`);
        console.log(response.data);

    } catch (e) {
        console.error(`[Debug] Error: ${e.message}`);
        if (e.response) {
            console.error(`[Debug] Response Status: ${e.response.status}`);
            console.error(`[Debug] Response Data:`, e.response.data);
        }
    }
};

const target = process.argv[2] || 'alexisbcook';
debugKaggle(target);
