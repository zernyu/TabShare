define([
    'dojo/_base/declare', 'dojo/_base/lang',
    'dojo/store/Memory'
], function(declare, lang,
            Memory) {

    /**
     * Custom Object Store used for WindowContainers. Supports reordering of tabs.
     * // TODO: refactor to reorder tabs of non-physical windows (other computers, scratch space)
     */
    return declare([Memory], {
        /**
         * Overriding to call onMove if the user is attempting to drag/drop a tab.
         * @param {Tab}     object  Reference to the tab being moved
         * @param {Object}  options An object with additional options such as sort order
         * @return {number} The id of the tab being added/moved
         */
        put: function(object, options){
            options = options || {};

            // If there is a "before" property, the user is attempting to move a tab
            if(options.before){
                // "Fork" a call to onMove with information about the tab being moved
                setTimeout(lang.partial(this.onMove,
                                        object.id,
                                        object.index,
                                        options.before.index),  0);
            }
            return this.inherited(arguments);
        },

        /**
         * Called when a Tab is being moved. It is here to be hooked into.
         * @param {number}      tabId           The ID of the tab to be moved
         * @param {number}      currentIndex    The index of the tab to be moved
         * @param {number}      targetIndex     The index of the tab to be moved in front of
         */
        onMove: function(tabId, currentIndex, targetIndex) {}
    });
});