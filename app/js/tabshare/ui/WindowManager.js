define([
    'module',
    'dojo/_base/array', 'dojo/_base/declare', 'dojo/_base/lang'
], function(module,
            array, declare, lang) {

    /**
     * This is the manager that will handle creating/updating/removing WindowContainers, which
     * are representations of the browser's open windows and its tabs
     */
    declare(module.id.replace(/\//g, '.'), null, {
        windowMap: {},  // A map of window IDs to WindowContainers

        /**
         * Register Chrome events and handlers in the constructor
         * @constructor
         */
        constructor: function() {
            var tabEvents = [
                'onAttached',
                'onCreated',
                'onDetached',
                'onMoved',
                'onRemoved',
                'onUpdated'
            ];

            array.forEach(tabEvents, function(event) {
                chrome.tabs[event].addListener(lang.hitch(this, this.onTabEvent, event));
            }, this);

            var windowEvents = [
                'onCreated',
                'onRemoved'
            ];

            array.forEach(windowEvents, function(event) {
                chrome.windows[event].addListener(lang.hitch(this, this.onWindowEvent, event));
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
         * Handler for Tab events
         * @param {string}       event  The event that was fired
         * @param {(Tab|number)} tab    Reference to a Tab or its ID
         * @param {Object=}      info   An optional object with extra event info
         */
        onTabEvent: function(event, tab, info) {
            console.log(event, arguments);

            // Find the window that should be updated and call its Tab event handler
            var windowId = this._findWindowIdByTab(tab);
            if (windowId in this.windowMap) {
                this.windowMap[windowId].onTabEvent(event, tab, info);
            }
        },

        /**
         * Handler for Window events
         * @param          {string} event   The event that was fired
         * @param {(Window|number)} window  Reference to a Window or its ID
         */
        onWindowEvent: function(event, window) {
            console.log(event, window);

            if (!isNaN(window)) {
                this.removeWindow(window);
            }
        },

        /**
         * Remove a WindowContainer from the window map and destroy it
         * @param {number} windowId The ID of the Window being closed
         */
        removeWindow: function(windowId) {
            if (windowId in this.windowMap) {
                this.windowMap[windowId].destroyRecursive();
                delete this.windowMap[windowId];
            }
        },

        /**
         * Find the given Tab's containing Window ID
         * @param {(Tab|number)} tab Reference to a Tab or its ID
         * @return {number} The Window ID of the Tab
         * @private
         */
        _findWindowIdByTab: function(tab) {
            // In some cases, the tab parameter can be an object that has a window ID attribute
            if (isNaN(tab)) {
                return tab.windowId;
            }

            // Otherwise, we have to search for the right window
            for (var windowId in this.windowMap) {
                if (this.windowMap[windowId].hasTab(tab)) {
                    return windowId;
                }
            }
        }
    });
});