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
