const express = require('express');
const people = require('../JsonFiles/people.json');
const guildies = require('../JsonFiles/guildies.json');
const router = express.Router();

//This is the Home base page that you come to - And the JS here is the logic for handling the base home page you come to

router.get('/', (req, res) => {    
    res.render('home',{ //Renders Index.pug in Views
        title: 'Wipes on Trash Attendency List',
        Confirmed: people.Confirmed,
        Attending: people.Attending,
        notAttending: people.notAttending,
        maybeAttending: people.maybeAttending,
        Missing: people.Missing,
        StandBy: people.StandBy,
        allGuildies: guildies.allGuildies
    });
});

module.exports = router;