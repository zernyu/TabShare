define([
    'module',
    'tabshare/ui/WindowContainer',
    'tabshare/ui/grid/_SourceMixin',
    'dojo/_base/array', 'dojo/_base/connect', 'dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/window'
], function(module,
            WindowContainer,
            _SourceMixin,
            array, connect, declare, lang, win) {
    /**
     * This is the manager that will handle creating/updating/removing WindowContainers, which
     * are representations of the browser's open windows and its tabs
     */
    return declare(module.id.replace(/\//g, '.'), null, {
        windowMap: {}, // A map of window IDs to WindowContainers
        tabId: null,   // The ID of the tab this WindowManager is in

        /**
         * Register Chrome events and handlers in the constructor
         * @constructor
         */
        constructor: function() {
            // Add listeners to Chrome Tab events
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

            // Add listeners to Chrome Window events
            var windowEvents = [
                'onCreated',
                'onRemoved'
            ];
            array.forEach(windowEvents, function(event) {
                chrome.windows[event].addListener(lang.hitch(this, this.onWindowEvent, event));
            }, this);

            // Add listener for dragging and dropping tabs between WindowContainer
            connect.subscribe(_SourceMixin.prototype.classPath + '/moveExternal', this, this.moveExternal);

            // Add listener for dragging and dropping tabs within the same WindowContainer
            connect.subscribe(_SourceMixin.prototype.classPath + '/moveInternal', this, this.moveInternal);

            // Add listener for when a WindowContainer is focused
            connect.subscribe(_SourceMixin.prototype.classPath + '/focus', this, this.focusWindow);

            // Grab the ID of the tab this WindowContainer is in
            chrome.tabs.getCurrent(lang.hitch(this, function(tab) {
                this.tabId = tab.id;
            }));
        },

        /**
         * Add a Window to the WindowManager
         * @param {number} windowId The ID of the Window to manage
         */
        addWindow: function(windowId) {
            // Create a new WindowContainer to represent the Window being managed
            var windowContainer = new WindowContainer({
                windowId: windowId,
                zIndex: Object.keys(this.windowMap).length
            });
            windowContainer.placeAt(win.body());
            windowContainer.startup();

            // Keep track of the window in the window manager!
            this.windowMap[windowContainer.windowId] = windowContainer;
        },

        /**
         * Move the WindowContainer into focus
         * @param {WindowContainer} windowContainer The WindowContainer to move into focus
         */
        focusWindow: function(windowContainer) {
            // Find the largest z-index out of all current WindowContainers
            var largestIndex = 0;
            for (var windowId in this.windowMap) {
                if (!this.windowMap.hasOwnProperty(windowId)) {
                    continue;
                }

                var window = this.windowMap[windowId];
                if (window.get('zIndex') > largestIndex) {
                    largestIndex = window.get('zIndex');
                }
            }

            // Set the given WindowContainer's z-index to the highest value
            windowContainer.set('zIndex', largestIndex + 1);
        },

        /**
         * Move the selected tabs to a another window
         * @param {WindowContainer} targetWindow    The window to move the tabs to
         * @param {Source}          sourceSource    The dgrid Source containing the tabs
         * @param {NodeList}        nodes           The tabs to be moved
         * @param {Tab=}            targetItem      The tab to be moved in front of
         */
        moveExternal: function(targetWindow, sourceSource, nodes, targetItem){
            var grid = targetWindow.grid;
            var sourceWindow = this.windowMap[sourceSource.grid.windowId];

            // Get the target index to give the tabs being moved
            var targetIndex;
            if (targetItem) {
                // If there is a targetItem, we are dragging the tab(s) in front of another tab
                targetIndex = targetItem.index;
            } else {
                // Otherwise we are dragging the tab(s) to the end
                targetIndex = targetWindow.store.data.length;
            }

            // Finally, move the tabs!
            array.forEach(nodes, function(node) {
                var tabId = sourceWindow.grid.row(node).data.id;
                chrome.tabs.move(tabId, {windowId: grid.windowId, index: targetIndex++},
                    lang.hitch(this, function() {
                        // If the user is dragging this dashbaord page, keep it focused!
                        if (tabId === this.tabId) {
                            chrome.tabs.update(tabId, {active: true});
                            chrome.windows.update(grid.windowId, {focused: true});
                        }
                    })
                );
            }, this);
        },

        /**
         * Move the selected tabs in the window to a new position in the window
         * @param {WindowContainer} windowContainer The window the tabs are in
         * @param {NodeList}        nodes           The tabs to be moved
         * @param {Tab=}             targetItem     The tab to be moved in front of
         */
        moveInternal: function(windowContainer, nodes, targetItem) {
            var grid = windowContainer.grid;

            // Get the target index to give the tabs being moved
            var targetIndex;
            if (targetItem) {
                // If there is a targetItem, we are dragging the tab(s) in front of another tab
                targetIndex = targetItem.index;

                // Grab the current index of the first tab in the array being dropped
                var firstIndex = grid.row(nodes[0]).data.index;
                if (firstIndex < targetIndex) {
                    // If moving the tab to the left, the target index should be 1 less
                    targetIndex--;
                }
            } else {
                // Otherwise we are dragging the tab(s) to the end
                targetIndex = windowContainer.store.data.length;
            }

            // Finally, move the tabs!
            array.forEach(nodes, function(node) {
                var tabId = grid.row(node).data.id;
                chrome.tabs.move(tabId, {index: targetIndex++});
            });
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
            var windowId = info && (info.newWindowId || info.oldWindowId);
            if (!windowId) {
                windowId = this._findWindowIdByTab(tab);
            }
            if (windowId in this.windowMap) { // TODO: WindowNotFoundException?
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

            switch(event) {
                case 'onCreated':
                    this.addWindow(window.id);
                    break;
                case 'onRemoved':
                    this.removeWindow(window);
                    break;
            }
        },

        /**
         * Remove a WindowContainer from the window map and destroy it
         * @param {number} windowId The ID of the Window being closed
         */
        removeWindow: function(windowId) {
            if (windowId in this.windowMap) { // TODO: WindowNotFoundException?
                this.windowMap[windowId].destroyRecursive();
                delete this.windowMap[windowId];
            }
        },

        /**
         * Find the given Tab's containing Window ID
         * @param {(Tab|number)} tab Reference to a Tab or its ID
         * @return {number} The Window ID of the Tab or -1 if not found
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

            return -1;
        }
    });
});