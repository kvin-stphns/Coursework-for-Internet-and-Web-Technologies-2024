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

        Object.keys(req.query).forEach(key => {
            const value = req.query[key].toLowerCase();
            
            if (key === 'won') {
                // Direct comparison for 'won', assuming 'yes'/'no' are used in the JSON
                results = results.filter(item => item.Won.toLowerCase() === value);
            } else if (key === 'year') {
                // Special handling for 'year' to allow partial matching (e.g., just entering '1960')
                results = results.filter(item => item.Year.startsWith(value));
            } else {
                // Default handling for other fields (case-insensitive, partial matching)
                results = results.filter(item => item[key] && item[key].toString().toLowerCase().includes(value));
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
