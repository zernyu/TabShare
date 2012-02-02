define([
    'module',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/dnd/move',
    'dojo/text!./templates/SessionContainer.html',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane',
        'dgrid/List'
], function(module, array, declare, html, lang, move, template, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin) {
    return declare(module.id.replace(/\//g, '.'), [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        baseClass: 'sessionContainer',

        titleBar: null, // Reference to the title bar node
        contentBox: null, // Reference to the main contents node

        postCreate: function() {
            chrome.tabs.query({}, lang.hitch(this, function(tabs) {
                array.forEach(tabs, function(tab) {
                    html.create("p", {innerHTML: tab.title}, this.contentBox.domNode);
                }, this);
            }));

            new move.parentConstrainedMoveable(this.domNode, {
                handle: this.titleBar.domNode,
                area: 'content',
                within: true
            });
        }
    });
});
