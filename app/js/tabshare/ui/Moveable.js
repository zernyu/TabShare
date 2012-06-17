define([
    'dojo/_base/declare',
    'dojo/dnd/move'
], function(declare,
            move) {
    /**
     * Extending to disable right-click drag
     */
    return declare([move.parentConstrainedMoveable], {
        onMouseDown: function(e){
            if (e.button === 0) {
                this.inherited(arguments);
            }
        }
    });
});