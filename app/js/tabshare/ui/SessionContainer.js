define([
    'module',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/dnd/move',
    'dojo/text!./templates/SessionContainer.html',
    'dgrid/Keyboard',
    'dgrid/List',
    'dgrid/Selection',
    'dijit/_Widget',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/_TemplatedMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
], function(module,
            array, declare, html, lang, move, template,
            Keyboard, List, Selection,
            _Widget, _WidgetsInTemplateMixin, _TemplatedMixin) {

    /**
     * This widget is a mini representation of a browser window. It has
     * a list of the tabs open in this window and the tabs are draggable
     * between windows.
     */
    return declare(module.id.replace(/\//g, '.'), [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        baseClass: 'sessionContainer',

        titleBar: null, // Reference to the title bar node
        contentBox: null, // Reference to the main contents node

        grid: null, // Reference to the dgrid containing the list of tabs

        buildRendering: function() {
            this.inherited(arguments);

            // Create the dgrid to display the currently open tabs
            var TabList = declare([List, Selection, Keyboard]);
            this.grid = new TabList({}, this.contentBox.domNode);

            // Make the SessionContainer draggable
            new move.parentConstrainedMoveable(this.domNode, {
                handle: this.titleBar.domNode,
                area: 'content',
                within: true
            });
        },

        postCreate: function() {
            chrome.tabs.query({}, lang.hitch(this, function(tabs) {
                this.grid.renderArray(array.map(tabs, function(tab) {
                    return tab.title;
                }));
            }));
        }
    });
});
