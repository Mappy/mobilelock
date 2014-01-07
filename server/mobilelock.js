var _ = require('underscore');
var path = require('path');

var mobilelock = function (config) {

    var devices = require('./devices-repository')(config.devices);

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
            app.use(express.static(path.resolve(__dirname+'/../www')));
            app.use(express.logger());
            app.use(express.bodyParser());
            app.use(app.router);
        });
        server.listen(config.server.port);
        app.get('/board', function(req,res){
            res.sendfile(path.resolve(__dirname + '/../www/board.html'));
        });
        app.get('/api/config', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(_.omit(config, 'server'));
        });
        app.get('/api/devices', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(devices.getAll());
        });
        app.get('/api/isLocked', function(req, res) {
            res.setHeader('content-type', 'application/json');
            if (!req.query.uuid) {
                res.send(statusCodeMissingParameters);
            } else {
                var device = devices.get(req.query.uuid);
                if (device) {
                    res.send(device);
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
                var knownDevice = devices.get(req.body.uuid);
                if (knownDevice) {
                    knownDevice.who = req.body.who;
                    knownDevice.free = false;
                    knownDevice.lastrent = new Date();
                    sendToBoards('update', knownDevice);
                } else  {
                    if (!req.body.model || !req.body.os) {
                        status = statusCodeMissingParameters;
                    } else {
                        var modelAlreadyListed = devices.findByModel(req.body.model);
                        if (modelAlreadyListed) {
                            status = 409; // Conclict : device already exists
                        } else {
                            var newDevice = { 'uuid': req.body.uuid, 'who': req.body.who, 'ua': ua, 'model': req.body.model, 'os': req.body.os, 'free': false };
                            devices.add(newDevice);
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
                var device = devices.get(req.body.uuid);
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
        try {
            devices.persist();
            console.log('Results persisted on disk');
        } catch (e) {
            console.log('Error while persisting results :', e.message);
        } finally {
            process.exit();
        }
    };

    return {
        'launch': launch,
        'saveAndQuit': saveAndQuit
    };
};

module.exports = mobilelock;

