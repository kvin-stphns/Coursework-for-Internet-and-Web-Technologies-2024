document.addEventListener('DOMContentLoaded', () => {
    // Attaching event listeners to buttons
    document.getElementById('get-nominations').addEventListener('click', handleGetNominations);
    document.getElementById('get-nominees').addEventListener('click', handleGetNominees);
    document.getElementById('clear-input').addEventListener('click', clearInputFields);
    document.getElementById('clear-output').addEventListener('click', clearOutput);

    // Handle "Get Nominations" button click
    function handleGetNominations() {
        // Validate inputs
        if (document.getElementById('nomInfo').value && (document.getElementById('nominee').value || document.getElementById('info').value)) {
            alert('Please enter a value in either "Nominee or Info" or in both "Nominee" and "Info", but not all three.');
            return;
        }

        // Build query string
        let queryString = buildQueryString([
            'year', 'category', 'nominee', 'info', 'won'
        ]);

        // Fetch data from server
        fetchData('nominations', queryString, displayNominations);
    }

    // Handle "Get Nominees" button click
    function handleGetNominees() {
        // No validation needed; fetching all nominees

        // Build query string for nominees
        let queryString = buildQueryString([
            'times', // Include 'times' parameter to filter nominees by the number of nominations/wins
        ]);

        // Fetch data from server
        fetchData('nominees', queryString, displayNominees);
    }

    // Clear input fields
    function clearInputFields() {
        document.querySelectorAll('#oscarsQueryForm input').forEach(input => {
            input.value = '';
        });
        document.getElementById('won').value = '';
    }

    // Clear output area
    function clearOutput() {
        document.getElementById('output').innerHTML = '';
    }

    // Build query string from form inputs
    function buildQueryString(params) {
        return params.map(param => {
            const value = document.getElementById(param).value;
            return value ? `${param}=${encodeURIComponent(value)}` : '';
        }).filter(part => part).join('&');
    }    

    // Fetch data from the server and display
    function fetchData(endpoint, queryString, displayFunction) {
        fetch(`http://localhost:8080/${endpoint}?${queryString}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => displayFunction(data))
            .catch(error => console.error('Fetch error:', error));
    }

    // Dynamically generate table for nominations
    function displayNominations(data) {
        const table = document.createElement('table');
        table.innerHTML = '<tr><th>Year</th><th>Category</th><th>Nominee</th><th>Info</th><th>Won?</th></tr>';
        data.forEach(item => {
            const row = table.insertRow(-1);
            row.innerHTML = `<td>${item.Year}</td><td>${item.Category}</td><td>${item.Nominee}</td><td>${item.Info}</td><td>${item.Won}</td>`;
        });
        clearOutput(); // Clear previous results
        document.getElementById('output').appendChild(table);
    }

    // Dynamically generate table for nominees
    function displayNominees(data) {

        data.sort((a, b) => b.nominations - a.nominations);
        const table = document.createElement('table');
        table.innerHTML = '<tr><th>Nominee</th><th>Number of Times</th></tr>';
        data.forEach(item => {
            const row = table.insertRow(-1);
            row.innerHTML = `<td>${item.nominee}</td><td>${item.nominations}</td>`; // Adjust these keys based on the actual response structure
        });
        clearOutput(); // Clear previous results
        document.getElementById('output').appendChild(table);
    }
});
