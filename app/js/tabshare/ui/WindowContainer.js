define([
    'module',
    'dojo/_base/array', 'dojo/_base/connect', 'dojo/_base/declare', 'dojo/_base/html', 'dojo/_base/lang',
    'dojo/dnd/move',
    'dojo/store/Memory',
    'tabshare/ui/Moveable', 'tabshare/ui/Mover',
    'dojo/text!./templates/WindowContainer.html',
    'dgrid/extensions/DnD', 'dgrid/Keyboard', 'dgrid/OnDemandGrid', 'dgrid/Selection',
    'dijit/_FocusMixin', 'dijit/_TemplatedMixin', 'dijit/_WidgetBase', 'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
], function(module,
            array, connect, declare, html, lang,
            move,
            Memory,
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
        contentBox: null, // Reference to the main contents node

        grid: null,       // Reference to the dgrid containing the list of tabs
        moveHandle: null, // Reference to the Moveable handle

        tabs: null,       // An array of the window's tabs
        windowId: null,   // The ID of this window

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
        },

        // Widget lifecycle
        buildRendering: function() {
            this.inherited(arguments);

            // Create the dgrid to display the currently open tabs
            var TabGrid = declare([Grid, Selection, Keyboard, DnD]);
            var gridNode = html.create('div', {}, this.contentBox.domNode);
            this.grid = new TabGrid({
                store: new Memory({
                    data: array.map(this.tabs, function(tab) {
                        return {
                            id: tab.id,
                            index: tab.index,
                            title: tab.title,
                            url: tab.url
                        };
                    })
                }),
                columns: [
                    {
                        field: 'title'
                    }
                ],
                showHeader: false
            }, gridNode);

            // Make the WindowContainer draggable
            this.moveHandle = new Moveable(this.domNode, {
                handle: this.titleBar.domNode,
                area: 'content',
                within: true,
                mover: Mover
            });
        },

        postCreate: function() {
            connect.subscribe('/tabshare/windowUpdate', this, this.refresh);
        },

        startup: function() {
            this.inherited(arguments);
            this.grid.startup();
        },

        uninitialize: function() {
            this.grid.destroy();
            this.moveHandle.destroy();
        }
    });
});