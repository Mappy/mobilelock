var _ = require('underscore');

var mobilelock = function(config, resultsFileName, persistedResults) {

    var devices = persistedResults || {};

    var launch = function() {
        var express = require('express');
        var app = express();
        var server = require('http').createServer(app);
        var io = require('socket.io').listen(server);

        var statusCodeMissingParameters = 400;

        var boards = []; // socket.io - boards
        var clients = {}; // socket.io - clients / devices

        var sendToBoards = function(t, msg) {
            for(var i in boards) {
                boards[i].emit(t, msg);
            }
        };

        app.configure(function() {
            app.use(express.compress());
            app.use(express.static( __dirname+'/../www'));
            app.use(express.logger());
            app.use(express.bodyParser());
            app.use(app.router);
        });
        server.listen(config.server.port);
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
            if (!req.query.uuid) {
                res.send(statusCodeMissingParameters);
            } else {
                var device = devices[req.query.uuid];
                if (device) {
                    res.send(JSON.stringify(device));
                } else {
                    res.send(404);
                }

            }
        });
        app.post('/api/lock', function(req, res) {
            var status = 200;
            var ua = req.get('User-Agent');
            if (!ua || !req.body.uuid || !req.body.who) {
                status = statusCodeMissingParameters;
            } else {
                var knownDevice = devices[req.body.uuid];
                if (knownDevice) {
                    knownDevice.who = req.body.who;
                    knownDevice.free = false;
                    knownDevice.lastrent = new Date();
                    sendToBoards('update', knownDevice);
                } else  {
                    if (!req.body.model || !req.body.os) {
                        status = statusCodeMissingParameters;
                    } else {
                        var modelAlreadyListed = _.find(devices, function(device) {
                            if (device.model === req.body.model) {
                                return device;
                            }
                        });
                        if (modelAlreadyListed) {
                            status = 409; // Conclict : device already exists
                        } else {
                            var newDevice = { 'uuid': req.body.uuid, 'who': req.body.who, 'ua': ua, 'model': req.body.model, 'os': req.body.os, 'free': false };
                            devices[req.body.uuid] = newDevice;
                            sendToBoards('add', newDevice);
                        }
                    }
                }
            }
            res.send(status);
        });
        app.post('/api/unlock', function(req, res) {
            var status = 200;
            if (!req.body.uuid) {
                status = statusCodeMissingParameters;
            } else {
                var device = devices[req.body.uuid];
                if (device) {
                    device.free = true;
                    device.lastrent = new Date();
                    sendToBoards('update', device);
                }
            }
            res.send(status);
        });

        io.sockets.on('connection', function (socket) {
            socket.emit('hello', { 'hello': 'world' });
            socket.on('register', function (data) {
                if (data.type === 'device') {
                    clients[data.uuid] = socket;
                    console.log('registered a device', data);
                } else if (data.type === 'board') {
                    boards.push(socket);
                    console.log('registered a board', data);
                }
            });
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
