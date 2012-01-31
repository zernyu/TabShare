define([
    'dojo/_base/lang',
    'tabshare/ui/SessionContainer'
], function(lang) {
    chrome.tabs.query({}, function(tabs) {
        dojo.forEach(tabs, function(tab) {
            dojo.create("p", {innerHTML: tab.title}, dojo.body());
        });
    });

    return lang.getObject('tabshare');
});
