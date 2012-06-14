define([
    'module',
    'dojo/_base/array', 'dojo/_base/declare', 'dojo/_base/html', 'dojo/_base/lang',
    'dojo/aspect',
    'dojo/dnd/move',
    'dojo/store/Observable',
    'tabshare/data/TabStore',
    'tabshare/ui/Moveable', 'tabshare/ui/Mover',
    'dojo/text!./templates/WindowContainer.html',
    'dgrid/extensions/DnD', 'dgrid/Keyboard', 'dgrid/OnDemandGrid', 'dgrid/Selection',
    'dijit/_FocusMixin', 'dijit/_TemplatedMixin', 'dijit/_WidgetBase', 'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
], function(module,
            array, declare, html, lang,
            aspect,
            move,
            Observable,
            TabStore,
            Moveable, Mover,
            template,
            DnD, Keyboard, Grid, Selection,
            _FocusMixin, _TemplatedMixin, _WidgetBase, _WidgetsInTemplateMixin) {

    /**
     * This widget is a mini representation of a browser window. It has
     * a list of the tabs open in this window and the tabs are draggable
     * between windows.
     */
    return declare(module.id.replace(/\//g, '.'), [_WidgetBase, _FocusMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        baseClass: 'windowContainer',

        titleBar: null,   // Reference to the title bar node
        gridNode: null,   // Reference to the dgrid node

        grid: null,       // Reference to the dgrid displaying the list of tabs
        store: null,      // Reference to the store containing the list of tabs
        moveHandle: null, // Reference to the Moveable handle

        windowId: null,   // The ID of this window

        buildRendering: function() {
            this.inherited(arguments);

            // Create the store to hold the currently open tabs
            this.store = new TabStore();
            // Hook into a tab reorder request from the store to actually move the tab in Chrome
            aspect.before(this.store, 'onMove', lang.hitch(this, function(tabId, currentIndex, targetIndex) {
                // We need different target index values depending on if we're moving a tab before or after
                if (currentIndex < targetIndex) {
                    targetIndex--;
                }
                // Move the tab to the new position!
                chrome.tabs.move(tabId, {index: targetIndex}, lang.hitch(this, this.refresh));
            }));

            // Create the dgrid to display the currently open tabs
            var TabGrid = declare([Grid, Selection, Keyboard, DnD]);
            this.grid = new TabGrid({
                store: Observable(this.store),
                columns: [
                    {
                        field: 'title'
                    }
                ],
                showHeader: false
            }, this.gridNode);

            // Make the WindowContainer draggable
            this.moveHandle = new Moveable(this.domNode, {
                handle: this.titleBar.domNode,
                area: 'content',
                within: true,
                mover: Mover
            });
        },

        postCreate: function() {
            this.refresh();
        },

        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
        },

        uninitialize: function() {
            this.grid.destroy();
            this.moveHandle.destroy();

            this.inherited(arguments);
        },

        /**
         * Returns whether this window has a tab with the given ID
         * @param {number} tabId The tab ID to search for
         * @return {Boolean} Whether this window has a tab with the given ID
         */
        hasTab: function(tabId) {
            // Quick way of looking up a tab ID - tab ID is used as the store's index field
            return tabId in this.store.index;
        },

        /**
         * Handler for Tab events
         * @param {string}       event  The event that was fired
         * @param {(Tab|number)} tab    Reference to a tab or its ID
         * @param {Object=}      info   An optional object with extra event info
         */
        onTabEvent: function(event, tab, info) {
            switch(event) {
                case 'onCreated':
                case 'onAttached':
                case 'onDetached':
                case 'onMoved':
                case 'onRemoved':
                case 'onUpdated':
                default:
                    this.refresh();
                    break;
            }
        },

        /**
         * Refresh this window's open tabs
         */
        refresh: function() {
            chrome.tabs.getAllInWindow(this.windowId, lang.hitch(this, function(tabs) {
                this.grid.store.setData(array.map(tabs, function(tab) {
                    return {
                        id: tab.id,
                        index: tab.index,
                        title: tab.title,
                        url: tab.url
                    };
                }));
                this.grid.refresh();
            }));
        }
    });
});