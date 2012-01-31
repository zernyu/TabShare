define([
    'module',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/dnd/Moveable',
    'dojo/text!./templates/SessionContainer.html',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
], function(module, array, declare, html, lang, Moveable, template, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin) {
    return declare(module.id.replace(/\//g, '.'), [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        baseClass: 'sessionContainer',

        postCreate: function() {
            chrome.tabs.query({}, lang.hitch(this, function(tabs) {
                array.forEach(tabs, function(tab) {
                    html.create("p", {innerHTML: tab.title}, this.contentBox.domNode);
                }, this);
            }));

            var dnd = Moveable(this.domNode);
        }
    });
});
