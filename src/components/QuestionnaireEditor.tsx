// File: /src/components/QuestionnaireEditor.tsx

import React, { useState } from 'react';
import { IQuestionnaire } from '../models/Questionnaire';

interface QuestionnaireEditorProps {
  questionnaire: IQuestionnaire;
}

export const QuestionnaireEditor: React.FC<QuestionnaireEditorProps> = ({ questionnaire }) => {
  const [draft, setDraft] = useState<IQuestionnaire>(questionnaire);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const newQuestionnaire: IQuestionnaire = await res.json();
      setDraft(newQuestionnaire);
    } catch (err: any) {
      setError(err?.message || 'An unknown error occurred while generating the draft.');
    } finally {
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
    } catch (err: any) {
      setError(err?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const toggleCommentArea = (sectionId: string, questionId: string) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== questionId ? q : { ...q, commentArea: !q.commentArea }
              )
            }
      )
    }));
  };

  // Inline form state for small quick edits (add option, add label, edit logic)
  const [inlineForm, setInlineForm] = useState<
    | { type: 'addOption'; sectionId: string; questionId: string; label: string; value: string }
    | { type: 'addLabel'; sectionId: string; questionId: string; label: string }
    | { type: 'editLogic'; sectionId: string; questionId: string; condition: string }
    | null
  >(null);

  const openAddLabel = (sectionId: string, questionId: string) => {
    setInlineForm({ type: 'addLabel', sectionId, questionId, label: '' });
  };

  const openAddOption = (sectionId: string, questionId: string) => {
    setInlineForm({ type: 'addOption', sectionId, questionId, label: '', value: '' });
  };

  const openEditLogic = (sectionId: string, questionId: string) => {
    setInlineForm({ type: 'editLogic', sectionId, questionId, condition: '' });
  };

  const submitInlineForm = () => {
    if (!inlineForm) return;
    if (inlineForm.type === 'addLabel') {
      const { sectionId, questionId, label } = inlineForm;
      if (!label) return setInlineForm(null);
      setDraft((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                questions: s.questions.map((q) =>
                  q.id !== questionId ? q : { ...q, labels: [...(q.labels || []), label] }
                )
              }
        )
      }));
    } else if (inlineForm.type === 'addOption') {
      const { sectionId, questionId, label, value } = inlineForm;
      if (!label) return setInlineForm(null);
      const val = value || `${Date.now()}`;
      setDraft((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                questions: s.questions.map((q) =>
                  q.id !== questionId
                    ? q
                    : { ...q, options: [...(q.options || []), { label, value: val }] }
                )
              }
        )
      }));
    } else if (inlineForm.type === 'editLogic') {
      const { sectionId, questionId, condition } = inlineForm;
      if (!condition) return setInlineForm(null);
      setDraft((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                questions: s.questions.map((q) =>
                  q.id !== questionId
                    ? q
                    : { ...q, logic: [...(q.logic || []), { type: 'RouteTo', condition, targetId: '' }] }
                )
              }
        )
      }));
    }
    setInlineForm(null);
  };

  const cancelInlineForm = () => setInlineForm(null);

  const editLogic = (sectionId: string, questionId: string) => {
    const condition = prompt('Enter simple condition (e.g., Q1_response_value == "B")');
    if (!condition) return;
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== questionId
                  ? q
                  : {
                      ...q,
                      logic: [
                        ...(q.logic || []),
                        { type: 'RouteTo', condition, targetId: '' }
                      ]
                    }
              )
            }
      )
    }));
  };

  return (
    <div>
      <header>
        <h2>{draft.title}</h2>
        <span>Status: {draft.status}</span>
      </header>
      <div style={{ margin: '0.5em 0' }}>
        <button onClick={generateWithAI} disabled={loading}>
          {loading ? 'Generating...' : 'Generate with AI'}
        </button>
        {error && <div style={{ color: 'red', marginLeft: '1em' }}>{error}</div>}
      </div>
      <main>
        {draft.sections.map((section) => (
          <section key={section.id} style={{ border: '1px solid #ccc', margin: '1em 0', padding: '1em' }}>
            <h3>{section.title}</h3>
            {section.questions.map((question) => (
              <div key={question.id} style={{ marginBottom: '1em', padding: '0.5em', border: '1px dashed #aaa' }}>
                <strong>Type:</strong> {question.type} <br />
                <label>
                  <strong>Text:</strong>
                  <input
                    style={{ width: '100%' }}
                    value={question.text}
                    onChange={(e) => {
                      const text = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        sections: prev.sections.map((s) =>
                          s.id !== section.id
                            ? s
                            : {
                                ...s,
                                questions: s.questions.map((q) => (q.id !== question.id ? q : { ...q, text }))
                              }
                        )
                      }));
                    }}
                  />
                </label>

                {question.options && question.options.length > 0 && (
                  <div style={{ marginTop: '0.5em' }}>
                    <strong>Options:</strong>
                    {question.options.map((opt, idx) => (
                      <div key={opt.value} style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
                        <input
                          value={opt.label}
                          onChange={(e) => {
                            const label = e.target.value;
                            setDraft((prev) => ({
                              ...prev,
                              sections: prev.sections.map((s) =>
                                s.id !== section.id
                                  ? s
                                  : {
                                      ...s,
                                      questions: s.questions.map((q) =>
                                        q.id !== question.id
                                          ? q
                                          : {
                                              ...q,
                                              options: q.options?.map((oo, i) => (i !== idx ? oo : { ...oo, label }))
                                            }
                                      )
                                    }
                              )
                            }));
                          }}
                        />
                        <button
                          onClick={() => {
                            setDraft((prev) => ({
                              ...prev,
                              sections: prev.sections.map((s) =>
                                s.id !== section.id
                                  ? s
                                  : {
                                      ...s,
                                      questions: s.questions.map((q) =>
                                        q.id !== question.id
                                          ? q
                                          : { ...q, options: q.options?.filter((_, i) => i !== idx) }
                                      )
                                    }
                              )
                            }));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: '0.5em' }}>
                      <button onClick={() => openAddOption(section.id, question.id)}>Add Option</button>
                    </div>
                  </div>
                )}

                {/* Placeholders for editing logic, labels, and comment area toggle */}
                <div style={{ marginTop: '0.5em' }}>
                  <button onClick={() => openEditLogic(section.id, question.id)}>Edit Logic</button>
                  <button onClick={() => openAddLabel(section.id, question.id)}>Add Label</button>
                  <button onClick={() => toggleCommentArea(section.id, question.id)}>
                    {question.commentArea ? 'Disable Comment Area' : 'Enable Comment Area'}
                  </button>
                </div>
                {/* Inline small form area */}
                {inlineForm && inlineForm.sectionId === section.id && inlineForm.questionId === question.id && (
                  <div style={{ marginTop: '0.5em', padding: '0.5em', background: '#f9f9f9' }}>
                    {inlineForm.type === 'addLabel' && (
                      <div>
                        <input
                          placeholder="Label"
                          value={inlineForm.label}
                          onChange={(e) => setInlineForm({ ...inlineForm, label: e.target.value } as any)}
                        />
                        <button onClick={submitInlineForm}>Add</button>
                        <button onClick={cancelInlineForm}>Cancel</button>
                      </div>
                    )}
                    {inlineForm.type === 'addOption' && (
                      <div>
                        <input
                          placeholder="Option label"
                          value={inlineForm.label}
                          onChange={(e) => setInlineForm({ ...inlineForm, label: e.target.value } as any)}
                        />
                        <input
                          placeholder="Option value (optional)"
                          value={inlineForm.value}
                          onChange={(e) => setInlineForm({ ...inlineForm, value: e.target.value } as any)}
                        />
                        <button onClick={submitInlineForm}>Add</button>
                        <button onClick={cancelInlineForm}>Cancel</button>
                      </div>
                    )}
                    {inlineForm.type === 'editLogic' && (
                      <div>
                        <input
                          placeholder='Condition, e.g. Q1_response_value == "B"'
                          value={inlineForm.condition}
                          onChange={(e) => setInlineForm({ ...inlineForm, condition: e.target.value } as any)}
                          style={{ width: '70%' }}
                        />
                        <button onClick={submitInlineForm}>Add</button>
                        <button onClick={cancelInlineForm}>Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        ))}
      </main>
      <button onClick={saveDraft} disabled={loading}>
        {loading ? 'Saving...' : 'Save Draft'}
      </button>
    </div>
  );
};
