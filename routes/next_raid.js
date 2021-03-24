const express = require('express');
const router = express.Router();
const people = require('../JsonFiles/people.json');
const guildies = require('../JsonFiles/guildies.json');
const pageHolder = require('../JsonFiles/pageHolder.json');
const my_credentials = require('../secret/credentials.json');
const playwright = require('playwright');
const server_js = require('../server');

const fs = require('fs');

let check = false;
let browser = "";
let context = "";
let page = "";
let dateOfRaid = "";


router.get('/', function(req, res, next) {
	//let toParse = req.files.myFile.data.toString('utf8');
    
    //let splitOnLines = toParse.split('\n');
    //console.log("SplitOnLines is: " + splitOnLines.length + " elements long.");
    if(check){
        console.log("Check was true.");
    }
    else{
        console.log("Check was false.");
    }
    people.Confirmed = [];
    people.Attending = [];
    people.maybeAttending = [];
    people.notAttending = [];
    people.StandBy = [];
    people.Missing = [];
        

    let amountofConfirmed = 0;
    let amountofAttending = 0;
    let amountofMaybe = 0;
    let amountofNot = 0;
    let amountofstandBy = 0;
    let amountofMissing = 0;
    let eventDate = "";

    let start = false;
    let stop = false;

    let confirmed = false; // 1
    let attending = false;  // 2
    let maybeAttending = false; // 3
    let notAttending = false; // 4
    let standBy = false; // 5
    let Missing = false; //6
    let name = "";
    let namesParsed = [];
    let foundDate = false;
    

    (async () => {
      for (const browserType of ['firefox']) {
            //HERE IS ASYNCH
            if(!pageHolder.browserOpen){
                pageHolder.browserOpen = true;
                browser = await playwright[browserType].launch({ headless: false });
                context = await browser.newContext({ viewport: { width: 1900, height: 1005 }});
                page = await context.newPage();
                await page.goto('https://www.wipesontrash.eu/events', {
                    waitUntil: 'networkidle0',
                });
                //await page.goto('https://www.wipesontrash.eu/events');
                const myLocalValue = my_credentials.username;  
                await delay(1000);  
                await page.$eval('input[name=username]', (el, value) => el.value = value, myLocalValue);
                const myPassWord = my_credentials.password;
                await delay(1000);
                await page.$eval('input[type="password"]', (el, value) => el.value = value, myPassWord);
                await delay(1000);
                await page.$eval('input[type="submit"]', (element) => element.click());
                await page.waitForNavigation({
                    waitUntil: 'networkidle0',
                  });

                if(dateOfRaid == ""){
                    var d = new Date();
                    var day = d.getDay();
                    await page.mouse.click(1100, 366); //Week list
                    await delay(1000);
                    await page.mouse.click(435, 370); //Today button
                    await delay(1000);
    
                    if(day > 1){
                        await delay(1000);
                        await page.mouse.click(1100, 366); //Week list
                        await delay(1000);
                        await page.mouse.click(555, 370); //Next button - Works
                        await delay(1000);
                        await page.mouse.click(475, 500); //The sunday element
                        server_js.isSunday = true;
                        server_js.isMonday = false;
                    }
                    if(day == 1){
                        await delay(1000);
                        await page.mouse.click(1100, 366); //Week list
                        await delay(1000);
                        await page.mouse.click(435, 370); //Today button
                        await delay(1000); 
                        await page.mouse.click(575, 500); //The monday element, Sunday is 475, 500
                        server_js.isSunday = false;
                        server_js.isMonday = true;
                    }
                    if(day == 0){
                        await delay(1000);
                        await page.mouse.click(1100, 366); //Week list
                        await delay(1000);
                        await page.mouse.click(435, 370); //Today button
                        await delay(1000);
                        await page.mouse.click(475, 500); //The Sunday Element
                        server_js.isSunday = true;
                        server_js.isMonday = false;
                    }
                }
                server_js.page = page;
            }
            else if(pageHolder.browserOpen){ //THe browser is already open
                page = server_js.page;
                await page.mouse.click(1100, 366); //Week list
                await delay(1000);
                if(server_js.isMonday){
                    await page.mouse.click(555, 370); //Next button - Works
                    await delay(1000);
                    await page.mouse.click(475, 500); //The Sunday Element
                    server_js.isSunday = true;
                    server_js.isMonday = false;
                }
                else if(server_js.isSunday){
                    await page.mouse.click(575, 500); //The monday element, Sunday is 475, 500
                    server_js.isSunday = false;
                    server_js.isMonday = true;
                }
                server_js.page = page;
            }
            
            
            await delay(2000);
            let content = await page.content();
            await delay(1000);
            let splitOnTagEnd = content.split('>');
            let counter = 0;

            
            // (GMT +1)</div
            splitOnTagEnd.forEach(element => {
                if(element.includes('<div class="scroller"')) {
                    console.log("Started writing process, because found: " + element);
                    start = true;
                    stop = false;
                }
                if(element.includes("Sunday") && !element.includes("calendar") && !element.includes("Weekly") && foundDate == false){
                    dateOfRaid = element.substring(0, (element.length - 14));
                    foundDate = true;
                }
                else if(element.includes("Monday") && !element.includes("calendar") && !element.includes("Weekly") && foundDate == false){
                    dateOfRaid = element.substring(0, (element.length - 14));
                    foundDate = true;
                }
                if(element.includes('<span class="confirmed"')){
                    confirmed = true;
                    attending = false;  // 2
                    maybeAttending = false; // 3
                    notAttending = false; // 4
                    standBy = false; // 5
                    Missing = false;
                }
                else if(element.includes('<span class="attending"')){
                    confirmed = false;
                    attending = true;  // 2
                    maybeAttending = false; // 3
                    notAttending = false; // 4
                    standBy = false; // 5
                    Missing = false;
                }
                else if(element.includes('<span class="maybe"')){
                    confirmed = false;
                    attending = false;  // 2
                    maybeAttending = true; // 3
                    notAttending = false; // 4
                    standBy = false; // 5
                    Missing = false;
                    console.log("found element for maybe: " + element);
                }
                else if(element.includes('<span class="not-attending"')){
                    confirmed = false;
                    attending = false;  // 2
                    maybeAttending = false; // 3
                    notAttending = true; // 4
                    standBy = false; // 5
                    Missing = false;
                }
                else if(element.includes('<span class="standby"')){
                    confirmed = false;
                    attending = false;  // 2
                    maybeAttending = false; // 3
                    notAttending = false; // 4
                    standBy = true; // 5
                    Missing = false;
                }
                if(start == true && stop == false) {
                    if(element.includes('<a data-minitooltip="')){ //It's a name Element
                        let splitName = element.split('"');
                        name = splitName[1];
                        if(confirmed){
                            namesParsed.push(name + " confirmed");
                            amountofConfirmed += 1;
                        }
                        else if(attending){
                            namesParsed.push(name + " attending");
                            amountofAttending += 1;
                        }
                        else if(maybeAttending){
                            namesParsed.push(name + " maybe");
                            amountofMaybe += 1;
                        }
                        else if(notAttending){
                            namesParsed.push(name + " notAttending");
                            amountofNot += 1;
                        }
                        else if(standBy){
                            namesParsed.push(name + " standBy");
                            amountofstandBy += 1;
                        }
                        confirmed = false;
                        attending = false;  // 2
                        maybeAttending = false; // 3
                        notAttending = false; // 4
                        standBy = false; // 5
                        Missing = false;
                }
                if(element.includes('<div class="attend-options" style="display: block;"')) {
                    start = false;
                    stop = true;
                   }
                }
            }) //END OF SPLITONTAGEND

            guildies.allGuildies.forEach(element => {
                let foundGuildie = false;
                namesParsed.forEach(innerElement => {
                    let name = innerElement.split(" ");
                    if(element.username.toLowerCase().includes(name[0].toLowerCase())){
                        if(innerElement.toLowerCase().includes("confirmed")){
                            people.Confirmed.push(JSON.parse(buildJson(element.username, element.role, element.id, element.note)));
                            foundGuildie = true;
                        }
                        else if(innerElement.toLowerCase().includes("notattending")){
                            people.notAttending.push(JSON.parse(buildJson(element.username, element.role, element.id, element.note)));
                            foundGuildie = true;
                        }
                        else if(innerElement.toLowerCase().includes("attending") && !innerElement.toLowerCase().includes("notattending")){
                            people.Attending.push(JSON.parse(buildJson(element.username, element.role, element.id, element.note)));
                            foundGuildie = true;
                        }
                        else if(innerElement.toLowerCase().includes("maybe")){
                            people.maybeAttending.push(JSON.parse(buildJson(element.username, element.role, element.id, element.note)));
                            foundGuildie = true;
                        }
                        else if(innerElement.toLowerCase().includes("standby")){
                            people.StandBy.push(JSON.parse(buildJson(element.username, element.role, element.id, element.note)));
                            foundGuildie = true;
                        }
                    }
                })
                if(!foundGuildie){
                    people.Missing.push(JSON.parse(buildJson(element.username, element.role, element.id, element.note)));
                    amountofMissing += 1;
                }
            })

            
            check = true;
            

            res.render('next_raid',{
                title: 'Wipes on Trash Attendance List - for ' + dateOfRaid, 
                Confirmed: people.Confirmed,
                Attending: people.Attending,
                notAttending: people.notAttending,
                maybeAttending: people.maybeAttending,
                Missing: people.Missing,
                StandBy: people.StandBy,
                allGuildies: guildies.allGuildies,
                amountofConfirmed: amountofConfirmed,
                amountofAttending: amountofAttending,
                amountofMaybe: amountofMaybe,
                amountofNot: amountofNot,
                amountofstandBy: amountofstandBy,
                amountofMissing: amountofMissing
            });
            
            } // LOGIC FOR FIREFOX BROWSER PART
        } // BEFORE CONST BROWSERTYPE LOOP
    )(); //END OF ASYNC
}) //END OF ROUTER.GET

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

function buildJson(username, role, id, note){
    let toBuild = "";
    toBuild += '{ "username":"' + username + '", "role":"' + role + '", "id":"' + username + '", "note":"' + note + '"}'; 
    return toBuild;
}

module.exports = { router };