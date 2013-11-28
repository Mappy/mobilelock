var fs = require('fs');
var _ = require('underscore');

var DEVICES_FILENAME = 'persisted-devices.json';

fs.readFile(__dirname+'/config.json', 'utf8', function (err, data) {
    if (err) { 
        return console.log('No config file found :', err);
    }

    try {
        var config = JSON.parse(data);
        var results = {};

        fs.readFile(DEVICES_FILENAME, 'utf8', function (err, data) {
            if (!err) { 
                results = JSON.parse(data);
            }

            var mobilelock = require('./mobilelock')(config, DEVICES_FILENAME, results);
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

