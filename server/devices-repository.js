var path = require('path'),
    fs   = require('fs'),
    _    = require('underscore');

function DevicesRepository (storeName) {
    this._storeName = path.join(__dirname, '..', storeName);

    this._devices = fs.existsSync(this._storeName) ?
        require(this._storeName) :
        {};
}

DevicesRepository.prototype.add = function (device) {
    this._devices[device.uuid] = device;
};

DevicesRepository.prototype.getAll = function () {
    return _.clone(this._devices);
};

DevicesRepository.prototype.get = function (uuid) {
    return this._devices[uuid];
};

DevicesRepository.prototype.getByModel = function (model) {
    return _.find(this._devices, function (device) {
        if (device.model === model) {
            return device;
        }
    });
};

DevicesRepository.prototype.persist = function () {
    fs.writeFileSync(this._storeName, JSON.stringify(this._devices));
};

module.exports = function (devicesConfig) {
    return new DevicesRepository(devicesConfig.storeName);
};

