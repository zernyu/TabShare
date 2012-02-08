define([
    'module',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/dnd/move',
    'tabshare/ui/Moveable',
    'tabshare/ui/Mover',
    'dojo/text!./templates/SessionContainer.html',
    'dgrid/Keyboard',
    'dgrid/List',
    'dgrid/Selection',
    'dijit/_FocusMixin',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
], function(module,
            array, declare, html, lang, move, Moveable, Mover, template,
            Keyboard, List, Selection,
            _FocusMixin, _TemplatedMixin, _WidgetBase, _WidgetsInTemplateMixin) {

    /**
     * This widget is a mini representation of a browser window. It has
     * a list of the tabs open in this window and the tabs are draggable
     * between windows.
     */
    return declare(module.id.replace(/\//g, '.'), [_WidgetBase, _FocusMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        baseClass: 'sessionContainer',

        titleBar: null, // Reference to the title bar node
        contentBox: null, // Reference to the main contents node

        grid: null, // Reference to the dgrid containing the list of tabs
        tabs: null, // An array of the window's tabs

        buildRendering: function() {
            this.inherited(arguments);

            // Create the dgrid to display the currently open tabs
            var TabList = declare([List, Selection, Keyboard]);
            var gridNode = html.create('div', {}, this.contentBox.domNode);
            this.grid = new TabList({}, gridNode);

            // Make the SessionContainer draggable
            new Moveable(this.domNode, {
                handle: this.titleBar.domNode,
                area: 'content',
                within: true,
                mover: Mover
            });
        },

        postCreate: function() {
            this.grid.renderArray(array.map(this.tabs, function(tab) {
                return tab.title;
            }));
        }
    });
});