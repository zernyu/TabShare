define(['dojo', 'dojo/dnd/Moveable'], function(dojo, Moveable) {
    /**
     * Extending to disable right-click drag
     */
    return dojo.declare([Moveable], {
        onMouseDown: function(e){
            if (e.button === 0) {
                this.inherited(arguments);
            }
        }
    });
});