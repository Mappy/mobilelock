var MobileLock = (function(undefined) {

    var $devices = $('#devices ul');
    var tplDevices = _.template($('#tpl-devices').text());

    var launch = function() {
        $.get('/api/devices', function(devices) {
            $devices.html(tplDevices(devices));
        });
    }
    $(launch);
})();
