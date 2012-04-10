define([
    'module',
    'dojo/_base/connect', 'dojo/_base/declare', 'dojo/_base/window',
    'dojo/store/Memory'
], function(module,
            connect, declare, window,
            Memory) {

    /**
     * This is the manager that will handle creating/updating/removing WindowContainers, which
     * are representations of the browser's open windows and its tabs
     */
    declare(module.id.replace(/\//g, '.'), null, {
        windowMap: {},  // A map of window IDs to WindowContainers

        /**
         * Add a WindowContainer to the window map
         * @param windowContainer   the WindowContainer
         */
        addWindow: function(/* WindowContainer */ windowContainer) {
            this.windowMap[windowContainer.windowId] = windowContainer;
        },

        /**
         *
         * @param windowId
         */
        removeWindow: function(/* int */ windowId) {
            this.windowMap[windowId].destroy();
            delete this.windowMap[windowId];
        }
    });
});