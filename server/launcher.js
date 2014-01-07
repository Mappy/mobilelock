var fs     = require('fs'),
    _      = require('underscore'),
    config = require('./config');

var mobilelock = require('./mobilelock')(config);
mobilelock.launch();

process.stdin.resume(); //so the program will not close instantly
process.on('SIGINT', function () {
    mobilelock.saveAndQuit();
});

