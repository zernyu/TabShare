define([
    'dojo/_base/connect'
], function(connect) {
    /**
     * A mixin for dgrid's DND Source to override some functions
     */
    return {
        delay: 10, // Don't start drag unless if mouse moves over 10px

        /**
         * Overriding to prevent DND happening if the user isn't clicking on a row
         * @override
         */
        _legalMouseDown: function(evt) {
            var legal = this.inherited('_legalMouseDown', arguments);
            return legal && evt.target !== this.grid.contentNode;
        },

        /**
         * Overriding to make the DND avatar the same width as the grid it was created from
         * @override
         */
        onDndStart: function(source, nodes, copy) {
            // summary:
            //   listen for start events to apply style change to avatar

            this.inherited('onDndStart', arguments); // Source.prototype.onDndStart.apply(this, arguments);
/*            if (source == this) {
                // Make the avatar the same width as the grid it was dragged from
                Manager.manager().avatar.node.style.width = html.contentBox(nodes[0]).w + 'px';

                // Make the row nodes fade out more aggressively than the default
                query('.dojoDndAvatarItem', Manager.manager().avatar.node).forEach(function(node, i) {
                    html.style(node, 'opacity', (9 - (i*2))/10);
                });
            }*/
        },

        /**
         * Overriding to delegate drop handling to the WindowManager
         * @override
         */
        onDropExternal: function(sourceSource, nodes, copy, targetItem) {
            connect.publish('tabshare/ui/WindowContainer/moveExternal',
                [this, sourceSource, nodes, targetItem]);
        },

        /**
         * Overriding to delegate drop handling to the WindowManager
         * @override
         */
        onDropInternal: function(nodes, copy, targetItem) {
            connect.publish('tabshare/ui/WindowContainer/moveInternal',
                [this, nodes, targetItem]);
        }
    };
});