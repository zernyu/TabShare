define([
    'module',
    'dojo/_base/array', 'dojo/_base/connect', 'dojo/_base/declare', 'dojo/_base/Deferred', 'dojo/_base/html', 'dojo/_base/lang',
    'dojo/aspect',
    'dojo/dom-construct', 'dojo/dom-style',
    'dojo/dnd/move',
    'dojo/store/Observable',
    'tabshare/data/TabStore',
    'tabshare/ui/dnd/Moveable', 'tabshare/ui/dnd/Mover',
    'tabshare/ui/grid/Selection', 'tabshare/ui/grid/_SourceMixin',
    'tabshare/util/delay',
    'dojo/text!./templates/WindowContainer.html',
    'dgrid/extensions/DnD', 'dgrid/Keyboard', 'dgrid/OnDemandGrid',
    'dijit/_FocusMixin', 'dijit/_TemplatedMixin', 'dijit/_WidgetBase', 'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
], function(module,
            array, connect, declare, Deferred, html, lang,
            aspect,
            domConstruct, domStyle,
            move,
            Observable,
            TabStore,
            Moveable, Mover,
            Selection, _SourceMixin,
            delay,
            template,
            DnD, Keyboard, Grid,
            _FocusMixin, _TemplatedMixin, _WidgetBase, _WidgetsInTemplateMixin) {

    /**
     * This widget is a mini representation of a browser window. It has
     * a list of the tabs open in this window and the tabs are draggable
     * between windows.
     */
    return declare(module.id.replace(/\//g, '.'), [_WidgetBase, _FocusMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        baseClass: 'windowContainer',
        focusedClass: 'focused',

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
                windowId: this.windowId,
                store: Observable(this.store),
                columns: [
                    {
                        field: 'favicon',
                        renderCell: function(object, favicon, td) {
                            domConstruct.create("img", {
                                src: favicon,
                                width: 16,
                                height: 16,
                                title: object.title
                            }, td);
                        }
                    },
                    {
                        field: 'title',
                        renderCell: function(object, title, td) {
                            domConstruct.create("h1", {
                                innerHTML: title
                            }, td);
                            domConstruct.create("h2", {
                                innerHTML: object.url
                            }, td);
                        }
                    }
                ],
                showHeader: false, // Hide the grid header
                dndParams: _SourceMixin, // Override some drag and drop callbacks
                deselectOnRefresh: false, // Keep selections across grid refreshes
                allowSelectAll: true      // Enable ctrl+a selection
            }, this.gridNode);

            // Make the WindowContainer draggable
            this.moveHandle = new Moveable(this.domNode, {
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
         * @return {boolean} Whether this window has a tab with the given ID
         */
        hasTab: function(tabId) {
            // Quick way of looking up a tab ID - tab ID is used as the store's index field
            return tabId in this.store.index;
        },

        /**
         * Handler for when the WindowContainer is focused.
         */
        onFocus: function() {
            // Let the WindowManager know this WindowContainer was focused
            connect.publish('tabshare/ui/WindowContainer/focus', [this]);
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
            // Debounce the actual refresh functionality
            if (!this._refresh) {
                this._refresh = delay.debounce(function() {
                    chrome.tabs.getAllInWindow(this.windowId, lang.hitch(this, function(tabs) {
                        this.grid.store.setData(array.map(tabs, function(tab) {
                            return {
                                id: tab.id,
                                index: tab.index,
                                title: tab.title,
                                url: tab.url,
                                // If no favicon found, use Chrome's default favicon
                                favicon: tab.favIconUrl ? tab.favIconUrl
                                                        : 'chrome://favicon/' + tab.url
                            };
                        }));
                        this.grid.refresh();
                    }));
                }, 150, this);
            }

            this._refresh();
        },

        /**
         * Setter for the Window's z-index. Pretty much a convenience method
         * @param {number} zIndex The z-index to set on this window's DOM node
         */
        _setZIndexAttr: function(zIndex) {
            domStyle.set(this.domNode, 'z-index', zIndex);
            this.zIndex = zIndex;
        }
    });
});