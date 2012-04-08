define([
    'module',
    'dojo/_base/array',
    'dojo/_base/connect',
    'dojo/_base/declare',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/dnd/move',
    'dojo/store/Memory',
    'dojo/store/Observable',
    'tabshare/ui/Moveable',
    'tabshare/ui/Mover',
    'dojo/text!./templates/WindowContainer.html',
    'dgrid/Keyboard',
    'dgrid/OnDemandList',
    'dgrid/Selection',
    'dijit/_FocusMixin',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
], function(module,
            array, connect, declare, html, lang,
            move,
            Memory,
            Observable,
            Moveable, Mover,
            template,
            Keyboard, List, Selection,
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
        tabs: null,       // An array of the window's tabs
        windowId: null,   // The ID of this window

        buildRendering: function() {
            this.inherited(arguments);

            // Create the dgrid to display the currently open tabs
            var TabList = declare([List, Selection, Keyboard]);
            var gridNode = html.create('div', {}, this.contentBox.domNode);
            this.grid = new TabList({
                store: new Memory({
                    data: array.map(this.tabs, function(tab) {
                        return tab.title
                    })
                })
            }, gridNode);

            // Make the WindowContainer draggable
            new Moveable(this.domNode, {
                handle: this.titleBar.domNode,
                area: 'content',
                within: true,
                mover: Mover
            });
        },

        postCreate: function() {
            // Populate the grid with the current window's open tabs
//            this.grid.renderArray(array.map(this.tabs, function(tab) {
//                return tab.title;
//            }));

            connect.subscribe('/tabshare/windowUpdate', this, this.refresh);
        },

        refresh: function() {
            chrome.tabs.getAllInWindow(this.windowId, lang.hitch(this, function(tabs) {
                this.grid.renderArray(array.map(tabs, function(tab) {
                    return tab.title;
                }));
            }));
        }
    });
});