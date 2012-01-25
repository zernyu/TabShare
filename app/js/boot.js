require([
  'dojo',
  'dojo/domReady!'
], function() {
  chrome.tabs.query({}, function(tabs) {
    dojo.forEach(tabs, function(tab) {
      dojo.create("p", {innerHTML: tab.title}, dojo.body());
    });
  });
});
