var _ = require('underscore');

var mobilelock = function(config, resultsFileName, persistedDevices) {

    var devices = persistedDevices || {};

    devices = { 
        "devices": [ 
            { "ua": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:25.0) Gecko/20100101 Firefox/25.0"}
        ]
    };
    
    var launch = function() {
        var express = require('express');
        var app = express();

        app.configure(function() {
            app.use(express.compress());
            app.use(express.static( __dirname+'/../www'));
            app.use(express.logger());
            app.use(app.router);
        });
        app.listen(config.server.port);
        app.get('/api/config', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(_.omit(config, 'server'));
        });
        app.get('/api/devices', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(devices);
        });
        console.log('MobileLock server listening on '+config.server.port);
    };

    var saveAndQuit = function() {
        var fs = require('fs');
        fs.writeFile(resultsFileName, JSON.stringify(results), function (err) {
            if (err) { 
                console.log('Error while persisting results :', err);
            } else {
                console.log('Results persisted on disk');
            }
            process.exit();
        });
    };

    return {
        'launch': launch,
        'saveAndQuit': saveAndQuit
    };
};

module.exports = mobilelock;
