require([
    'dojo',
    'dojo/domReady!',
    'tabshare'
], function() {
    // Create the window manager to handle updating windows
    window.windowManager = new tabshare.ui.WindowManager(); // TODO: global namespace for debugging

    // Create a new container for each window
    chrome.windows.getAll({populate: true}, function(windows) {
        dojo.forEach(windows, function(window) {
            var windowContainer = new tabshare.ui.WindowContainer({
                tabs: window.tabs,
                windowId: window.id
            });
            windowContainer.placeAt(dojo.body());
            windowContainer.startup();

            // Keep track of the window in the window manager!
            windowManager.addWindow(windowContainer);
        });
    });

    var chromeEvents = [
        'onAttached',
        'onCreated',
        'onDetached',
        'onMoved',
        'onRemoved',
        'onUpdated'
    ];

    // TODO: need to implement a window manager
    dojo.forEach(chromeEvents, function(event) {
        chrome.tabs[event].addListener(function(tab, info) {
            dojo.publish('/tabshare/windowUpdate', event, tab, info);
            console.log(event, arguments);
        });
    });
});
