console.log('Fetching list');

const schedule = require('node-schedule');
const fetch = require('node-fetch');
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http');


let list = schedule.scheduleJob('1 * * * * *', () =>{

    let d = new Date();
    let day = d.getDate();
    if (day < 10){
        day = "0" + day;
    }
    let month = d.getMonth() + 1;
    let year = d.getFullYear();

    fetch("https://www.sodexo.fi/ruokalistat/output/daily_json/152/" + year + "-" + month + "-" + day)
        .then(res => res.json())
        .then(json => fs.writeFile('lista.json', JSON.stringify(json), (err) => {


            // error
            if (err) throw err;

            // success
            console.log('Saved');


        }));

    console.log('Saved');

});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {


    fs.readFile(__dirname + '/public/index.html', 'utf8', (err, text) => {
        res.send(text);


    });

});

let port = process.env.PORT || 80;
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});
app.listen(port, function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});