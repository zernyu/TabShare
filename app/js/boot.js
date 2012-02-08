require([
    'dojo',
    'dojo/domReady!',
    'tabshare'
], function() {
    chrome.windows.getAll({populate: true}, function(windows) {
        dojo.forEach(windows, function(window) {
            var sessionContainer = new tabshare.ui.SessionContainer({
                tabs: window.tabs
            });
            sessionContainer.placeAt(dojo.body());
        });
    });
});
