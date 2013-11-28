var MobileLock = (function(undefined) {

    var $devices = $('#devices ul');
    var tplDevices = _.template($('#tpl-devices').text());

    var devices = [ 
        { "ua": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:25.0) Gecko/20100101 Firefox/25.0"}
    ];

    var launch = function() {
        $devices.html(tplDevices({'devices':devices}));
    }
    $(launch);
})();
