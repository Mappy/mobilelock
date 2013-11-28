var _ = require('underscore');

var mobilelock = function(config, resultsFileName, persistedRresults) {

    var results = persistedRresults || {};

    
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

        console.log('Monitor server listening on '+config.server.port);
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
