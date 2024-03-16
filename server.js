// Import Express
const express = require('express');

// Create an Express app
const app = express();

// Specify the port to listen on
const port = 8080;

// Add CORS middleware to allow requests from any origin
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Define a route for the root of the site
app.get('/', (req, res) => {
    res.send('Oscars Nominations API');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


const fs = require('fs');
const path = require('path');

// Define a route for the nominations endpoint
app.get('/nominations', (req, res) => {
    const { year, category, nominee, won } = req.query;

    fs.readFile(path.join(__dirname, 'oscars.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Server error reading Oscars data' });
        }

        let nominations = JSON.parse(data);

        if (year) {
            nominations = nominations.filter(nomination => nomination.Year.includes(year));
        }

        if (category) {
            nominations = nominations.filter(nomination => nomination.Category.includes(category));
        }

        if (nominee) {
            nominations = nominations.filter(nomination => nomination.Nominee.includes(nominee));
        }

        if (won !== undefined) {
            const wonFilter = won === 'yes' ? 'Yes' : 'No';
            nominations = nominations.filter(nomination => nomination.Won === wonFilter);
        }

        res.json(nominations);
    });
});

// Define a route for the nominees endpoint
app.get('/nominees', (req, res) => {
    fs.readFile(path.join(__dirname, 'oscars.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Server error reading Oscars data' });
        }

        const nominations = JSON.parse(data);
        let nomineesCount = {};

        nominations.forEach(nomination => {
            const { Nominee, Won } = nomination;
            if (!nomineesCount[Nominee]) {
                nomineesCount[Nominee] = { nominations: 0, wins: 0 };
            }

            nomineesCount[Nominee].nominations += 1;
            if (Won === 'Yes') {
                nomineesCount[Nominee].wins += 1;
            }
        });

        // Convert the counts to an array and sort by number of nominations
        let sortedNominees = Object.keys(nomineesCount).map(nominee => ({
            nominee: nominee,
            nominations: nomineesCount[nominee].nominations,
            wins: nomineesCount[nominee].wins
        }));

        sortedNominees.sort((a, b) => b.nominations - a.nominations);

        res.json(sortedNominees);
    });
});
