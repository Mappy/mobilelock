var fs = require('fs');
var _ = require('underscore');

var RESULTS_FILENAME = 'persisted-results.json';

fs.readFile(__dirname+'/config.json', 'utf8', function (err, data) {
    if (err) { 
        return console.log('No config file found :', err);
    }

    try {
        var config = JSON.parse(data);
        var results = {};

        fs.readFile(RESULTS_FILENAME, 'utf8', function (err, data) {
            if (!err) { 
                results = JSON.parse(data);
            }

            var mobilelock = require('./mobilelock')(config, RESULTS_FILENAME, results);
            mobilelock.launch();

            process.stdin.resume(); //so the program will not close instantly
            process.on('SIGINT', function () {
                mobilelock.saveAndQuit();
            });
        });

    } catch(e) {
        console.log('Error while parsing configuration or something else...', e);
    }
});

