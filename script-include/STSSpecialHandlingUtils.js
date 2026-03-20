/**
 * STSSpecialHandlingUtils
 * 
 * Scoped Application : STS Customer Service (x_snc_sts_custsvc)
 * Table              : sys_script_include
 * API Name           : x_snc_sts_custsvc.STSSpecialHandlingUtils
 * Client Callable    : true
 * Accessible From    : All application scopes
 * 
 * PURPOSE:
 *   Reusable server-side utility to create Special Handling Notes on Cases.
 *   Can be called from ANY Client Script field change — not just the parent field.
 *   Priority, days valid, and all parameters are configurable.
 * 
 * USAGE (from any Client Script via GlideAjax):
 *   var ga = new GlideAjax('x_snc_sts_custsvc.STSSpecialHandlingUtils');
 *   ga.addParam('sysparm_name', 'ajaxCreateNote');
 *   ga.addParam('sysparm_case_id', g_form.getUniqueValue());
 *   ga.addParam('sysparm_note_text', userEnteredText);
 *   ga.addParam('sysparm_priority', '2');      // 1=Critical, 2=Moderate, 3=Low
 *   ga.addParam('sysparm_days_valid', '7');     // days until expiry
 *   ga.getXMLAnswer(function(answer) {
 *       if (answer) { g_form.addInfoMessage('Note created: ' + answer); }
 *   });
 */
var STSSpecialHandlingUtils = Class.create();
STSSpecialHandlingUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /**
     * Creates a Special Handling Note on a Case.
     * Designed to be reusable from any field change on the Case form.
     *
     * @param {string} caseId    - sys_id of the Case record (required)
     * @param {string} noteText  - Free-form text entered by the user (required)
     * @param {string} priority  - Priority value: '1'=Critical, '2'=Moderate, '3'=Low. Default: '2'
     * @param {number} daysValid - Number of days before the note expires. Default: 7
     * @returns {string} sys_id of the created Special Handling Note, or '' on failure
     */
    createSpecialHandlingNote: function(caseId, noteText, priority, daysValid) {
        try {
            // Validate required fields
            if (!caseId || !noteText) {
                gs.logWarning(
                    'STSSpecialHandlingUtils: caseId and noteText are required.',
                    'STSSpecialHandlingUtils'
                );
                return '';
            }

            // Apply defaults
            priority  = priority  || '2';  // Default: Moderate
            daysValid = daysValid  || 7;    // Default: 7 days

            // Calculate expiry date: today + daysValid days
            var expiryDate = new GlideDateTime();
            expiryDate.addDaysLocalTime(parseInt(daysValid));

            // Create the Special Handling Note record
            var note = new GlideRecord('sn_customerservice_special_handling_note');
            note.initialize();
            note.setValue('case',         caseId);
            note.setValue('note',         noteText);
            note.setValue('priority',     priority);    // 2 = Moderate per acceptance criteria
            note.setValue('display_type', 'popup');      // Show as popup on the case form
            note.setValue('active',       true);         // Active immediately
            note.setValue('expiry_date',  expiryDate);  // Expires after daysValid days

            var noteSysId = note.insert();

            gs.log(
                'STSSpecialHandlingUtils: Created note [' + noteSysId +
                '] for case [' + caseId + '] priority=' + priority +
                ' daysValid=' + daysValid,
                'STSSpecialHandlingUtils'
            );

            return noteSysId;

        } catch (e) {
            gs.logError(
                'STSSpecialHandlingUtils.createSpecialHandlingNote error: ' + e.message,
                'STSSpecialHandlingUtils'
            );
            return '';
        }
    },

    /**
     * GlideAjax entry point — called from Client Scripts on the Case form.
     * 
     * Required sysparm parameters:
     *   sysparm_case_id   - sys_id of the Case
     *   sysparm_note_text - Text for the note
     * 
     * Optional sysparm parameters:
     *   sysparm_priority   - Default '2' (Moderate)
     *   sysparm_days_valid - Default 7
     * 
     * Returns 'answer' attribute with the sys_id of the created note.
     */
    ajaxCreateNote: function() {
        var caseId    = this.getParameter('sysparm_case_id');
        var noteText  = this.getParameter('sysparm_note_text');
        var priority  = this.getParameter('sysparm_priority')   || '2';
        var daysValid = parseInt(this.getParameter('sysparm_days_valid')) || 7;

        var result = this.createSpecialHandlingNote(caseId, noteText, priority, daysValid);

        // Return result to client
        this.newItem('result').setAttribute('answer', result);
    },

    type: 'STSSpecialHandlingUtils'
});
