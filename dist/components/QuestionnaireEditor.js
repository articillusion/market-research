"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionnaireEditor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// File: /src/components/QuestionnaireEditor.tsx
const react_1 = require("react");
const QuestionnaireEditor = ({ questionnaire }) => {
    const [draft, setDraft] = (0, react_1.useState)(questionnaire);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const generateWithAI = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/generate-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'current-user' })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Server returned ${res.status}`);
            }
            const newQuestionnaire = await res.json();
            setDraft(newQuestionnaire);
        }
        catch (err) {
            setError(err?.message || 'An unknown error occurred while generating the draft.');
        }
        finally {
            setLoading(false);
        }
    };
    const saveDraft = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/save-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draft)
            });
            if (!res.ok) {
                throw new Error(`Failed to save: ${res.status}`);
            }
            // Optionally process response
            await res.json();
        }
        catch (err) {
            setError(err?.message || 'Failed to save draft');
        }
        finally {
            setLoading(false);
        }
    };
    const toggleCommentArea = (sectionId, questionId) => {
        setDraft((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => s.id !== sectionId
                ? s
                : {
                    ...s,
                    questions: s.questions.map((q) => q.id !== questionId ? q : { ...q, commentArea: !q.commentArea })
                })
        }));
    };
    // Inline form state for small quick edits (add option, add label, edit logic)
    const [inlineForm, setInlineForm] = (0, react_1.useState)(null);
    const openAddLabel = (sectionId, questionId) => {
        setInlineForm({ type: 'addLabel', sectionId, questionId, label: '' });
    };
    const openAddOption = (sectionId, questionId) => {
        setInlineForm({ type: 'addOption', sectionId, questionId, label: '', value: '' });
    };
    const openEditLogic = (sectionId, questionId) => {
        setInlineForm({ type: 'editLogic', sectionId, questionId, condition: '' });
    };
    const submitInlineForm = () => {
        if (!inlineForm)
            return;
        if (inlineForm.type === 'addLabel') {
            const { sectionId, questionId, label } = inlineForm;
            if (!label)
                return setInlineForm(null);
            setDraft((prev) => ({
                ...prev,
                sections: prev.sections.map((s) => s.id !== sectionId
                    ? s
                    : {
                        ...s,
                        questions: s.questions.map((q) => q.id !== questionId ? q : { ...q, labels: [...(q.labels || []), label] })
                    })
            }));
        }
        else if (inlineForm.type === 'addOption') {
            const { sectionId, questionId, label, value } = inlineForm;
            if (!label)
                return setInlineForm(null);
            const val = value || `${Date.now()}`;
            setDraft((prev) => ({
                ...prev,
                sections: prev.sections.map((s) => s.id !== sectionId
                    ? s
                    : {
                        ...s,
                        questions: s.questions.map((q) => q.id !== questionId
                            ? q
                            : { ...q, options: [...(q.options || []), { label, value: val }] })
                    })
            }));
        }
        else if (inlineForm.type === 'editLogic') {
            const { sectionId, questionId, condition } = inlineForm;
            if (!condition)
                return setInlineForm(null);
            setDraft((prev) => ({
                ...prev,
                sections: prev.sections.map((s) => s.id !== sectionId
                    ? s
                    : {
                        ...s,
                        questions: s.questions.map((q) => q.id !== questionId
                            ? q
                            : { ...q, logic: [...(q.logic || []), { type: 'RouteTo', condition, targetId: '' }] })
                    })
            }));
        }
        setInlineForm(null);
    };
    const cancelInlineForm = () => setInlineForm(null);
    const editLogic = (sectionId, questionId) => {
        const condition = prompt('Enter simple condition (e.g., Q1_response_value == "B")');
        if (!condition)
            return;
        setDraft((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => s.id !== sectionId
                ? s
                : {
                    ...s,
                    questions: s.questions.map((q) => q.id !== questionId
                        ? q
                        : {
                            ...q,
                            logic: [
                                ...(q.logic || []),
                                { type: 'RouteTo', condition, targetId: '' }
                            ]
                        })
                })
        }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsx)("h2", { children: draft.title }), (0, jsx_runtime_1.jsxs)("span", { children: ["Status: ", draft.status] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { margin: '0.5em 0' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: generateWithAI, disabled: loading, children: loading ? 'Generating...' : 'Generate with AI' }), error && (0, jsx_runtime_1.jsx)("div", { style: { color: 'red', marginLeft: '1em' }, children: error })] }), (0, jsx_runtime_1.jsx)("main", { children: draft.sections.map((section) => ((0, jsx_runtime_1.jsxs)("section", { style: { border: '1px solid #ccc', margin: '1em 0', padding: '1em' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: section.title }), section.questions.map((question) => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '1em', padding: '0.5em', border: '1px dashed #aaa' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Type:" }), " ", question.type, " ", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Text:" }), (0, jsx_runtime_1.jsx)("input", { style: { width: '100%' }, value: question.text, onChange: (e) => {
                                                const text = e.target.value;
                                                setDraft((prev) => ({
                                                    ...prev,
                                                    sections: prev.sections.map((s) => s.id !== section.id
                                                        ? s
                                                        : {
                                                            ...s,
                                                            questions: s.questions.map((q) => (q.id !== question.id ? q : { ...q, text }))
                                                        })
                                                }));
                                            } })] }), question.options && question.options.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '0.5em' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Options:" }), question.options.map((opt, idx) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '0.5em', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { value: opt.label, onChange: (e) => {
                                                        const label = e.target.value;
                                                        setDraft((prev) => ({
                                                            ...prev,
                                                            sections: prev.sections.map((s) => s.id !== section.id
                                                                ? s
                                                                : {
                                                                    ...s,
                                                                    questions: s.questions.map((q) => q.id !== question.id
                                                                        ? q
                                                                        : {
                                                                            ...q,
                                                                            options: q.options?.map((oo, i) => (i !== idx ? oo : { ...oo, label }))
                                                                        })
                                                                })
                                                        }));
                                                    } }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                        setDraft((prev) => ({
                                                            ...prev,
                                                            sections: prev.sections.map((s) => s.id !== section.id
                                                                ? s
                                                                : {
                                                                    ...s,
                                                                    questions: s.questions.map((q) => q.id !== question.id
                                                                        ? q
                                                                        : { ...q, options: q.options?.filter((_, i) => i !== idx) })
                                                                })
                                                        }));
                                                    }, children: "Remove" })] }, opt.value))), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '0.5em' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => openAddOption(section.id, question.id), children: "Add Option" }) })] })), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '0.5em' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => openEditLogic(section.id, question.id), children: "Edit Logic" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => openAddLabel(section.id, question.id), children: "Add Label" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleCommentArea(section.id, question.id), children: question.commentArea ? 'Disable Comment Area' : 'Enable Comment Area' })] }), inlineForm && inlineForm.sectionId === section.id && inlineForm.questionId === question.id && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '0.5em', padding: '0.5em', background: '#f9f9f9' }, children: [inlineForm.type === 'addLabel' && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "Label", value: inlineForm.label, onChange: (e) => setInlineForm({ ...inlineForm, label: e.target.value }) }), (0, jsx_runtime_1.jsx)("button", { onClick: submitInlineForm, children: "Add" }), (0, jsx_runtime_1.jsx)("button", { onClick: cancelInlineForm, children: "Cancel" })] })), inlineForm.type === 'addOption' && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "Option label", value: inlineForm.label, onChange: (e) => setInlineForm({ ...inlineForm, label: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { placeholder: "Option value (optional)", value: inlineForm.value, onChange: (e) => setInlineForm({ ...inlineForm, value: e.target.value }) }), (0, jsx_runtime_1.jsx)("button", { onClick: submitInlineForm, children: "Add" }), (0, jsx_runtime_1.jsx)("button", { onClick: cancelInlineForm, children: "Cancel" })] })), inlineForm.type === 'editLogic' && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { placeholder: 'Condition, e.g. Q1_response_value == "B"', value: inlineForm.condition, onChange: (e) => setInlineForm({ ...inlineForm, condition: e.target.value }), style: { width: '70%' } }), (0, jsx_runtime_1.jsx)("button", { onClick: submitInlineForm, children: "Add" }), (0, jsx_runtime_1.jsx)("button", { onClick: cancelInlineForm, children: "Cancel" })] }))] }))] }, question.id)))] }, section.id))) }), (0, jsx_runtime_1.jsx)("button", { onClick: saveDraft, disabled: loading, children: loading ? 'Saving...' : 'Save Draft' })] }));
};
exports.QuestionnaireEditor = QuestionnaireEditor;
