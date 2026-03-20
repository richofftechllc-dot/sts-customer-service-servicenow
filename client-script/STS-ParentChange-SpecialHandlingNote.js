/**
 * STS - Create Special Handling Note on Parent Change
 * 
 * Scoped Application : STS Customer Service (x_snc_sts_custsvc)
 * Table              : sn_customerservice_case
 * Type               : onChange
 * Field Name         : parent
 * UI Type            : Desktop
 * 
 * PURPOSE:
 *   When a Customer Service Clerk changes the Parent field on a Case,
 *   this script prompts them for free-form text and automatically creates
 *   a Special Handling Note (Priority: Moderate, Display: Popup, Valid: 7 days).
 * 
 *   The server-side logic is handled by STSSpecialHandlingUtils Script Include,
 *   making this pattern reusable for any other field on the Case form.
 * 
 * REUSABILITY:
 *   To trigger a Special Handling Note from a DIFFERENT field, create a new
 *   Client Script with the same GlideAjax call below - zero server changes needed.
 *   You can also change PRIORITY and DAYS_VALID per field as needed.
 */
function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    // GUARD: Do not fire when form first loads (isLoading = true)
    if (isLoading) {
        return;
    }

    // GUARD: Do not fire if the parent field was cleared/removed
    if (!newValue || newValue === '') {
        return;
    }

    // ---------------------------------------------------------------
    // CONFIGURATION — easily adjustable per field or business need
    // ---------------------------------------------------------------
    var PRIORITY   = '2';   // Moderate (1=Critical, 2=Moderate, 3=Low)
    var DAYS_VALID = 7;     // Note is valid for 7 days, then auto-expires
    // ---------------------------------------------------------------

    var caseId       = g_form.getUniqueValue();
    var parentDisplay = g_form.getDisplayValue('parent');

    // Prompt the user for the special handling note text
    var noteText = prompt(
        'Parent case has been set to: ' + parentDisplay + '\n\n' +
        'Please enter a Special Handling Note to communicate important information\n' +
        'to other agents reviewing this case.\n\n' +
        '(This note will display as a popup for ' + DAYS_VALID + ' days)',
        ''
    );

    // GUARD: User cancelled the dialog
    if (noteText === null) {
        return;
    }

    // GUARD: User submitted empty text
    if (noteText.trim() === '') {
        g_form.addInfoMessage('No Special Handling Note was created (empty text).');
        return;
    }

    // Call STSSpecialHandlingUtils server-side via GlideAjax
    // This is the REUSABLE pattern — copy this block to any other Client Script
    var ga = new GlideAjax('x_snc_sts_custsvc.STSSpecialHandlingUtils');
    ga.addParam('sysparm_name',       'ajaxCreateNote');
    ga.addParam('sysparm_case_id',    caseId);
    ga.addParam('sysparm_note_text',  noteText.trim());
    ga.addParam('sysparm_priority',   PRIORITY);
    ga.addParam('sysparm_days_valid', DAYS_VALID);

    ga.getXMLAnswer(function(answer) {
        if (answer && answer !== '') {
            // Success: note was created
            g_form.addInfoMessage(
                'Special Handling Note created successfully. ' +
                'It will display as a popup on this case for the next ' + DAYS_VALID + ' days.'
            );
        } else {
            // Failure: log and notify
            g_form.addErrorMessage(
                'Special Handling Note could not be created. ' +
                'Please contact your system administrator.'
            );
        }
    });
}
