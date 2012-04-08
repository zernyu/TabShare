require([
    'dojo',
    'dojo/domReady!',
    'tabshare'
], function() {
    // Create a new container for each window
    chrome.windows.getAll({populate: true}, function(windows) {
        dojo.forEach(windows, function(window) {
            var windowContainer = new tabshare.ui.WindowContainer({
                tabs: window.tabs,
                windowId: window.id
            });
            windowContainer.placeAt(dojo.body());
        });
    });

    var chromeEvents = [
        'onAttached',
        'onCreated',
        'onDetached',
        'onRemoved'
    ];

    // TODO: need to implement a window manager
    dojo.forEach(chromeEvents, function(event) {
        chrome.tabs[event].addListener(function(tab, info) {
            dojo.publish('/tabshare/windowUpdate', info);
        });
    });
});
