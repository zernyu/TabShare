define([
    'module',
    'dojo/_base/array', 'dojo/_base/connect', 'dojo/_base/declare', 'dojo/_base/lang'
], function(module,
            array, connect, declare, lang) {

    /**
     * This is the manager that will handle creating/updating/removing WindowContainers, which
     * are representations of the browser's open windows and its tabs
     */
    declare(module.id.replace(/\//g, '.'), null, {
        windowMap: {},  // A map of window IDs to WindowContainers

        constructor: function() {
            // Register Chrome events and handlers
            var tabEvents = [
                'onAttached',
                'onCreated',
                'onDetached',
                'onMoved',
                'onRemoved',
                'onUpdated'
            ];

            array.forEach(tabEvents, function(event) {
                chrome.tabs[event].addListener(function(tab, info) {
                    dojo.publish('/tabshare/tabUpdate', event, tab, info);
                    console.log(event, arguments);
                });
            });

            var windowEvents = [
                'onCreated',
                'onRemoved'
            ];

            array.forEach(windowEvents, function(event) {
                chrome.windows[event].addListener(lang.hitch(this, this.onWindowEvent));
            }, this);
        },

        /**
         * Add a WindowContainer to the window map
         * @param {tabshare.ui.WindowContainer} windowContainer The WindowContainer
         */
        addWindow: function(windowContainer) {
            this.windowMap[windowContainer.windowId] = windowContainer;
        },

        /**
         * Handler for window events
         * @param {(Window|number)} window Reference to a Window or its ID
         */
        onWindowEvent: function(window) {
            console.log(window);
            if (!isNaN(window)) {
                this.removeWindow(window);
            }
        },

        /**
         * Remove a WindowContainer from the window map and destroy it
         * @param {number} windowId The ID of the Window being closed
         */
        removeWindow: function(/* int */ windowId) {
            this.windowMap[windowId].destroyRecursive();
            delete this.windowMap[windowId];
        }
    });
});