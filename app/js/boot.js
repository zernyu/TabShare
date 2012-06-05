require([
    'dojo/_base/array',
        'dojo/domReady!',
        'tabshare'
], function(array) {
    // Create the window manager to handle updating windows
    // TODO: assigned to global namespace for debugging purposes
    window.windowManager = new tabshare.ui.WindowManager();

    // Create a new container for each window
    chrome.windows.getAll(function(windows) {
        array.forEach(windows, function(window) {
            windowManager.addWindow(window.id);
        });
    });
});
