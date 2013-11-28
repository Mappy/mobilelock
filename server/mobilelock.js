var _ = require('underscore');

var mobilelock = function(config, resultsFileName, persistedResults) {

    var results = persistedResults || { "devices": [] };

    var getPhoneName = function(ua) {
        if (ua.indexOf("iPhone OS 6_1") >= 0) {
            return "iPhone (iOs 6.1)";
        } else if (ua.indexOf("Galaxy Nexus") >= 0) {
            return "Galaxy Nexus (Android 4.3)";
        }
        return "Don’t know :-(";
    };
    
    var launch = function() {
        var express = require('express');
        var app = express();

        app.configure(function() {
            app.use(express.compress());
            app.use(express.static( __dirname+'/../www'));
            app.use(express.logger());
            app.use(express.bodyParser());
            app.use(app.router);
        });
        app.listen(config.server.port);
        app.get('/api/config', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(_.omit(config, 'server'));
        });
        app.get('/api/devices', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(results);
        });
        app.post('/api/lock', function(req, res) {
            var ua = req.get('User-Agent');
            var status = 200;
            if (!ua || !req.body.key || !req.body.who) {
                status = 418; // I’m a teapot... :-D
            } else {
                results.devices.push({ 'key': req.body.key, 'who': req.body.who, 'ua': ua, 'name': getPhoneName(ua) });
            }
            res.send(status);
        });
        app.post('/api/unlock', function(req, res) {
            var status = 200;
            if (!req.body.key) {
                status = 418; // I’m a teapot... :-D
            } else {
                results.devices = _.reject(results.devices, function(device) {
                    return device.key === req.body.key;
                });
            }
            res.send(status);
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
