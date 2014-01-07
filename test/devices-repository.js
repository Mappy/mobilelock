var fs     = require('fs'),
    should = require('should'),
    sinon  = require('sinon'),
    _      = require('underscore');

function getDevicesRepository () {
    return require('../server/devices-repository')({
        storeName: 'test.json'
    });
}

function getNewDevice () {
    return {
        uuid: new Date() + Math.random(),
        who: 'LFO',
        ua: 'ua',
        model: 'model',
        os: 'os',
        free: false
    };
}

describe('devices-repository', function () {
    it('should not throws an error if the file does not exits', function () {
        (function () {
            getDevicesRepository();
        }).should.not.throw();
    });

    describe('add()', function () {
        var devicesRepository = getDevicesRepository();

        it('should adds a device to the collection', function () {
            var device = getNewDevice();
            devicesRepository.add(device);
            should.exists(devicesRepository._devices[device.uuid]);
        });
    });

    describe('getAll()', function () {
        var devicesRepository = getDevicesRepository();

        it('should returns the collection of devices', function () {
            devicesRepository.add(getNewDevice());
            devicesRepository.add(getNewDevice());
            _.size(devicesRepository.getAll()).should.eql(2);
        });
    });

    describe('get()', function () {
        var devicesRepository = getDevicesRepository();

        it('should returns a device by its uuid', function () {
            var expectedDevice = getNewDevice();
            devicesRepository.add(expectedDevice);
            var actualDevice = devicesRepository.get(expectedDevice.uuid);
            expectedDevice.should.eql(actualDevice);
        });

        it ('should not returns a value if the uuid does not exits', function () {
            should.not.exists(devicesRepository.get('00000'));
        });
    });

    describe('getByModel()', function () {
        var devicesRepository = getDevicesRepository();

        it('should returns a device by its model', function () {
            var expectedDevice = getNewDevice();
            devicesRepository.add(expectedDevice);
            var actualDevice = devicesRepository.getByModel(expectedDevice.model);
            expectedDevice.should.eql(actualDevice);
        });

        it ('should not returns a value if the model does not exits', function () {
            should.not.exists(devicesRepository.getByModel('00000'));
        });
    });

    describe('persist()', function () {
        var devicesRepository   = getDevicesRepository(),
            fsWriteFileSyncSpy  = sinon.spy(),
            fsWriteFileSyncStub = sinon.stub(fs, 'writeFileSync', fsWriteFileSyncSpy);

        after(function () {
            fs.writeFileSync.restore();
        });

        it('should persists the collection to the file', function () {
            devicesRepository.persist();
            fsWriteFileSyncSpy.callCount.should.eql(1);
            fsWriteFileSyncSpy.calledWithMatch('test.json').should.be.true;
        });
    });
});

