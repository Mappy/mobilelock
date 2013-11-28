var _ = require('underscore');

var mobilelock = function(config, resultsFileName, persistedResults) {

    var results = persistedResults.devices ? persistedResults : { "devices": [] };
    
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
            var who = req.body.who;
            var ua = req.get('User-Agent');
            var status = 200;
            if (!who || !ua) {
                status = 418; // I’m a teapot... :-D
            } else {
                console.log(results);
                console.log(results.devices);
                results.devices.push({ 'who': who, 'ua': ua });
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
