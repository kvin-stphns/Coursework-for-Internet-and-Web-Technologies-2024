const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for all requests
app.use(cors());

// Read and parse the oscars.json file
function readOscarsData() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'oscars.json'), 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data));
        });
    });
}

// Endpoint for fetching nominations
app.get('/nominations', async (req, res) => {
    try {
        const data = await readOscarsData();
        let results = data;

        // Filtering logic
        Object.keys(req.query).forEach(key => {
            const queryValue = req.query[key].toLowerCase().trim(); // Normalize query for comparison

            if (key === 'won') {
                results = results.filter(item => item.Won.toLowerCase() === queryValue);
            } else if (key === 'nomInfo') {
                // Special handling that can match 'Nominee' or 'Info'
                results = results.filter(item => item.Nominee.toLowerCase().includes(queryValue) || item.Info.toLowerCase().includes(queryValue));
            } else if (['year', 'category', 'nominee', 'info'].includes(key)) {
                let adjustedKey = key.charAt(0).toUpperCase() + key.slice(1); // Capitalizes the first letter to match JSON keys
                results = results.filter(item => item[adjustedKey].toString().toLowerCase().includes(queryValue));
            }
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Server error reading Oscars data' });
    }
});




// Endpoint for fetching nominees
app.get('/nominees', async (req, res) => {
    try {
        const data = await readOscarsData();
        const nominees = {};

        data.forEach(item => {
            const nomineeName = item.Nominee;
            if (!nominees[nomineeName]) {
                nominees[nomineeName] = { nominations: 0 };
            }
            nominees[nomineeName].nominations += 1;
        });

        const results = Object.keys(nominees).map(nominee => ({
            nominee,
            nominations: nominees[nominee].nominations
        }));

        // Optionally filter results based on the 'times' query parameter if provided
        const filteredResults = req.query.times ? results.filter(item => item.nominations >= parseInt(req.query.times, 10)) : results;

        res.json(filteredResults);
    } catch (error) {
        res.status(500).json({ error: 'Server error processing nominees data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
