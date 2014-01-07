var should = require('should');

var mobilelock = require('../server/mobilelock')({
    server: {
        port: '4400'
    },
    devices: {
        storeName: 'test.json'
    }
});

describe('Mobilelock server', function() {
    describe('mobilelock.js#?', function() {
        it('should pass', function() {
            true.should.be.ok;
        });
    });
});

