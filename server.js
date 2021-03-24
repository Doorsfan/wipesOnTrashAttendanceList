const express = require('express');
const upload = require("express-fileupload");
const app = express();
const playwright = require('playwright');
const path = require('path');
const next_raid_js_file = require('./routes/next_raid');
const previous_raid_js_file = require('./routes/previous_raid');
const my_credentials = require('./secret/credentials.json');
const fs = require('fs');
const people = ('./JsonFiles/people');
const guildies = require('./JsonFiles/guildies.json');
const localtunnel = require('localtunnel');
const ngrok = require('ngrok');
const cron = require('node-cron');


app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');
var page = "";
var isSunday = false;
var isMonday = false;

var homeRouter = require('./routes/home');
const next_raid_Router = require('./routes/next_raid');
const previous_raid_Router = require('./routes/previous_raid');
app.use(express.static(__dirname + '/public'));
app.use('/', homeRouter);
app.use('/next_raid', next_raid_Router.router);
app.use('/previous_raid', previous_raid_Router.router);

//serve static files from the `public` folder
//app.use(express.static(__dirname + '/public'));

//Utilizes uplaod from Express to upload file, gives it as Byte array
app.use(upload());

//Syntax for Cronjob
// * * * * * *
// 1: Seconds
// 2: Minute
// 3: Hour
// 4: day of Month
// 5: Month
// 6: day of week

//To run every night at midnight, do option of 0 0 0 * * * 


function buildJson(username, role, id, note){
    let toBuild = "";
    toBuild += ',\n{\n  "username": "' + username + '",\n  "role": "' + role + '",\n  "id": "' + username + '",\n  "note":"' + note + '"\n}\n  ]\n}'; 
    return toBuild;
}



/*
//WORKS - USED FOR APPENDING MEMBER TO JSON FILE OF GUILDIES
fs.stat("./JsonFiles/guildies.json", (err, fileStats) => {
    fs.truncate("./JsonFiles/guildies.json", fileStats.size-6, function(err, bytes){ 
        let myString = buildJson("blyat", "cyka", "davaj", "niet");
        fs.appendFile("./JsonFiles/guildies.json", myString,function (err) {
            if (err) throw err;
            console.log('Blyat was appended to file.');
        }); 
    });
});
*/

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

cron.schedule('0 15 * * *', function() {
    (async () => {
        for (const browserType of ['firefox']) {
            browser = await playwright[browserType].launch({ headless: true });
            context = await browser.newContext({ viewport: { width: 1900, height: 1005 }});
            page = await context.newPage();
            await page.goto('https://www.wipesontrash.eu', {
                waitUntil: 'networkidle0',
            });
            await page.mouse.click(690, 435);
            delay(5000);
            await page.mouse.click(690, 435);
            let content = await page.content();
            fs.writeFile("./memberslist.txt", content, function (err) {
                if (err) throw err;
            });
            await delay(5000);
            let splitOnTagEnd = content.split('\n');
            let foundNewMember = false;
            let realName = "";
            let foundInRoster = false;
            splitOnTagEnd.forEach(element => {
                if(element.includes("joined Mon at ")){
                    console.log("Found Sunday element: " + element);
                    let mySplit = element.split('>');
                    let name = mySplit[1];
                    realName = name.substring(0, name.length-3);
                    console.log("name was " + realName);
                    foundNewMember = true;
                }
                else if(element.includes("joined Tue at ")){
                    console.log("Found Sunday element: " + element);
                    let mySplit = element.split('>');
                    let name = mySplit[1];
                    realName = name.substring(0, name.length-3);
                    console.log("name was " + realName);
                    foundNewMember = true;
                }
                else if(element.includes("joined Wed at ")){
                    console.log("Found Sunday element: " + element);
                    let mySplit = element.split('>');
                    let name = mySplit[1];
                    realName = name.substring(0, name.length-3);
                    console.log("name was " + realName);
                    foundNewMember = true;
                }
                else if(element.includes("joined Thu at ")){
                    console.log("Found Sunday element: " + element);
                    let mySplit = element.split('>');
                    let name = mySplit[1];
                    realName = name.substring(0, name.length-3);
                    console.log("name was " + realName);
                    foundNewMember = true;
                }
                else if(element.includes("joined Fri at ")){
                    console.log("Found Sunday element: " + element);
                    let mySplit = element.split('>');
                    let name = mySplit[1];
                    realName = name.substring(0, name.length-3);
                    console.log("name was " + realName);
                    foundNewMember = true;
                }
                else if(element.includes("joined Sat at ")){
                    console.log("Found Sunday element: " + element);
                    let mySplit = element.split('>');
                    let name = mySplit[1];
                    realName = name.substring(0, name.length-3);
                    console.log("name was " + realName);
                    foundNewMember = true;
                }
                else if(element.includes("joined Sun at ")){
                    console.log("Found Sunday element: " + element);
                    let mySplit = element.split('>');
                    let name = mySplit[1];
                    realName = name.substring(0, name.length-3);
                    console.log("name was " + realName);
                    foundNewMember = true;
                }
                if(foundNewMember){
                    foundInRoster = false;
                    guildies.allGuildies.forEach(element => {
                        if(element.username.toLowerCase().includes(realName.toLowerCase())){
                            foundInRoster = true;
                        }
                    });
                    if(!foundInRoster){
                        console.log("Failed to find " + realName + " in the roster.");
                        fs.stat("./JsonFiles/guildies.json", (err, fileStats) => {
                            fs.truncate("./JsonFiles/guildies.json", fileStats.size-6, function(err, bytes){ 
                                let myString = buildJson(realName, "?", realName, "");
                                fs.appendFile("./JsonFiles/guildies.json", myString,function (err) {
                                    if (err) throw err;
                                    console.log(realName + ' was appended to guildies file.');
                                }); 
                            });
                        });
                    }
                }
                foundNewMember = false;
            })
    }})();
});

const server = app.listen(80, () => {
    console.log(`Express running -> Port ${server.address().port}`);
    console.log("Adress is: " + server.address());
    }); 
 
module.exports = { page };