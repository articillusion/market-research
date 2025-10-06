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
    const addLabel = (sectionId, questionId) => {
        const label = prompt('Enter label to add');
        if (!label)
            return;
        setDraft((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => s.id !== sectionId
                ? s
                : {
                    ...s,
                    questions: s.questions.map((q) => q.id !== questionId ? q : { ...q, labels: [...(q.labels || []), label] })
                })
        }));
    };
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
                                                    }, children: "Remove" })] }, opt.value))), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '0.5em' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                    const label = prompt('Option label');
                                                    const value = prompt('Option value') || `${Date.now()}`;
                                                    if (!label)
                                                        return;
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        sections: prev.sections.map((s) => s.id !== section.id
                                                            ? s
                                                            : {
                                                                ...s,
                                                                questions: s.questions.map((q) => q.id !== question.id
                                                                    ? q
                                                                    : { ...q, options: [...(q.options || []), { label, value }] })
                                                            })
                                                    }));
                                                }, children: "Add Option" }) })] })), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '0.5em' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => editLogic(section.id, question.id), children: "Edit Logic" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => addLabel(section.id, question.id), children: "Add Label" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => toggleCommentArea(section.id, question.id), children: question.commentArea ? 'Disable Comment Area' : 'Enable Comment Area' })] })] }, question.id)))] }, section.id))) }), (0, jsx_runtime_1.jsx)("button", { onClick: saveDraft, disabled: loading, children: loading ? 'Saving...' : 'Save Draft' })] }));
};
exports.QuestionnaireEditor = QuestionnaireEditor;
