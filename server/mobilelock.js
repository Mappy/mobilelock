var _ = require('underscore');

var mobilelock = function(config, resultsFileName, persistedResults) {

    var devices = persistedResults || {};

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
            res.send(devices);
        });
        app.get('/api/isLocked', function(req, res) {
            res.setHeader('content-type', 'application/json');
            if (!req.query.key) {
                res.send(418); // I’m a teapot... :-D
            } else {
                var device = devices[req.body.key];
                if (device) {
                    res.send(JSON.stringify(device));
                } else {
                    res.send(404);
                }

            }
        });
        app.post('/api/lock', function(req, res) {
            var ua = req.get('User-Agent');
            var status = 200;
            if (!ua || !req.body.key || !req.body.who) {
                status = 418; // I’m a teapot... :-D
            } else {
                var device = devices[req.body.key];
                if (device) {
                    device.who = req.body.who;
                    device.free = false;
                } else {
                    devices[req.body.key] = { 'who': req.body.who, 'ua': ua, 'model': req.body.model, 'os': req.body.os, 'free': false };
                }
            }
            res.send(status);
        });
        app.post('/api/unlock', function(req, res) {
            var status = 200;
            if (!req.body.key) {
                status = 418; // I’m a teapot... :-D
            } else {
                var device = devices[req.body.key];
                if (device) {
                    device.free = true;
                }
            }
            res.send(status);
        });
        console.log('MobileLock server listening on '+config.server.port);
    };

    var saveAndQuit = function() {
        var fs = require('fs');
        fs.writeFile(resultsFileName, JSON.stringify(devices), function (err) {
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
