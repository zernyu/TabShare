define([
    'module',
    'dojo/_base/connect', 'dojo/_base/declare', 'dojo/_base/lang'
], function(module,
            connect, declare, lang) {
    /**
     * A mixin for dgrid's DND Source to override some functions
     */
    return declare(null, {
        classPath: module.id,

        /**
         * Overriding to prevent DND happening if the user isn't clicking on a row
         * @override
         */
        _legalMouseDown: function(evt) {
            var legal = this.inherited("_legalMouseDown", arguments);
            return legal && evt.target !== this.grid.contentNode;
        },

        /**
         * Overriding to delegate drop handling to the WindowManager
         * @override
         */
        onDropInternal: lang.hitch(this, function(nodes, copy, targetItem) {
            connect.publish(this.classPath + '/moveInternal',
                [this, nodes, targetItem]);
        }),

        /**
         * Overriding to delegate drop handling to the WindowManager
         * @override
         */
        onDropExternal: lang.hitch(this, function(sourceSource, nodes, copy, targetItem) {
            connect.publish(this.classPath + '/moveExternal',
                [this, sourceSource, nodes, targetItem]);
        })
    });
});