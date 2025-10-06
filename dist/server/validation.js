"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuestionnaire = validateQuestionnaire;
function validateQuestionnaire(q) {
    const errs = [];
    if (!q)
        return ['No questionnaire provided'];
    if (!q.id || typeof q.id !== 'string')
        errs.push('id is required and must be a string');
    if (!q.title || typeof q.title !== 'string')
        errs.push('title is required');
    if (!q.clientName || typeof q.clientName !== 'string')
        errs.push('clientName is required');
    if (!Array.isArray(q.sections))
        errs.push('sections must be an array');
    else {
        q.sections.forEach((s, si) => {
            if (!s.id)
                errs.push(`section[${si}].id is required`);
            if (!Array.isArray(s.questions))
                errs.push(`section[${si}].questions must be an array`);
        });
    }
    return errs;
}
