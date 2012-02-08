define([
    'dojo',
    'dojo/dnd/Mover',
    'dojo/touch'
], function(dojo, Mover, touch) {

    /**
     * Ghetto patch to fix superglue bug when right clicking
     */
    return dojo.declare([Mover], {
        _onMouseClickHandle: null,

        constructor: function(node, e, host) {
            this._onMouseClickHandle = dojo.connect(node.ownerDocument, touch.press, this, 'onMouseClick');
        },

        onMouseClick: function(event) {
            dojo.stopEvent(event);
            this._onMouseClickHandle.remove();
            this.destroy();
        }
    });
});