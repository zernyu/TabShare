require([
    'dojo',
    'dojo/domReady!',
    'tabshare'
], function() {
    chrome.windows.getAll({populate: true}, function(windows) {
        dojo.forEach(windows, function(window) {
            new tabshare.ui.SessionContainer(dojo.body());
            console.log(window);
        });
    });
});
