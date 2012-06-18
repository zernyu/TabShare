define([
    'dojo/_base/connect', 'dojo/_base/declare',
    'dojo/has',
    'dgrid/Selection'
], function(connect, declare,
            has,
            Selection) {

    /**
     * Overriding to fix various bugs with selection
     * @override
     */
    var ctrlEquiv = has("mac") ? "metaKey" : "ctrlKey";
    return declare([Selection], {
        selectionEvents: 'mousedown,mouseup,ondragstart,dgrid-cellfocusin',
        ignoreNextMouseUp: false, // Used to block actions on a subsequent mouseup event

        postCreate: function() {
            this.inherited(arguments);

            // Prevent the next mouseup event after DND from losing the current selection
            connect.subscribe('/dnd/start', this, function() {
                this.ignoreNextMouseUp = true;
            })
        },

        /**
         * @override
         */
        _handleSelect: function(event, currentTarget) {
            // don't run if selection mode is none,
            // or if coming from a dgrid-cellfocusin from a mousedown
            if (this.selectionMode == "none" ||
                (event.type == "dgrid-cellfocusin" && event.parentType == "mousedown")) {
                return;
            }

            // Return if the next mouseup event is to be ignored
            if (this.ignoreNextMouseUp) {
                this.ignoreNextMouseUp = false;

                if (event.type === 'mouseup') {
                    return;
                }
            }

            var ctrlKey = event.type == "mousedown" ? event[ctrlEquiv] : event.ctrlKey;
            if (event.type == "mousedown" || !event.ctrlKey || event.keyCode == 32) {
                var mode = this.selectionMode,
                    row = currentTarget,
                    rowObj = this.row(row),
                    lastRow = this._lastSelected;

                // If the row being clicked is already selected
                var alreadySelected = this.isSelected(row);

                if (mode == "single") {
                    if (lastRow == row) {
                        if (ctrlKey) {
                            // allow deselection even within single select mode
                            this.select(row, null, null);
                        }
                    } else {
                        this.clearSelection();
                        this.select(row);
                    }
                    this._lastSelected = row;
                } else {
                    var value;
                    // clear selection first for non-ctrl-clicks in extended mode,
                    // as well as for right-clicks on unselected targets
                    // only clear selection for left clicks on mouse up if clicking into an
                    // already selected row
                    if ((mode == "extended" && event.button != 2
                        && ((!alreadySelected && event.type == "mousedown" && !ctrlKey))
                            || (alreadySelected && event.type == "mouseup")) ||
                        (event.button == 2 && !(this.selection[rowObj.id]))) {
                        this.clearSelection(rowObj.id);
                    }
                    if (!event.shiftKey) {
                        // null == toggle; undefined == true;
                        lastRow = value = ctrlKey ? null : undefined;
                    }
                    this.select(row, lastRow, value);

                    if (!lastRow) {
                        // update lastRow reference for potential subsequent shift+select
                        // (current row was already selected by earlier logic)
                        this._lastSelected = row;
                    }
                }
                if (event.type == "mousedown" && (event.shiftKey || ctrlKey)) {
                    // prevent selection in firefox
                    event.preventDefault();
                }
            }
        }
    });
});