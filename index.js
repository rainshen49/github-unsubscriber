const fetch = require('node-fetch');
const fs = require('fs')

const ENDPOINT = "https://api.github.com/graphql";
const token = fs.readFileSync(".token").toString();
const query = fs.readFileSync("query.graphql").toString();

fetch(ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        "Authorization": "bearer " + token,
    },
    body: JSON.stringify({ query })
})
    .then(r => r.json())
    .then(data => {
        console.log('data returned');
        fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
    });