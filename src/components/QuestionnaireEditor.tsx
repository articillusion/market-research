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

  const addLabel = (sectionId: string, questionId: string) => {
    const label = prompt('Enter label to add');
    if (!label) return;
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
  };

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
                      <button
                        onClick={() => {
                          const label = prompt('Option label');
                          const value = prompt('Option value') || `${Date.now()}`;
                          if (!label) return;
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
                                        : { ...q, options: [...(q.options || []), { label, value }] }
                                    )
                                  }
                            )
                          }));
                        }}
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Placeholders for editing logic, labels, and comment area toggle */}
                <div style={{ marginTop: '0.5em' }}>
                  <button onClick={() => editLogic(section.id, question.id)}>Edit Logic</button>
                  <button onClick={() => addLabel(section.id, question.id)}>Add Label</button>
                  <button onClick={() => toggleCommentArea(section.id, question.id)}>
                    {question.commentArea ? 'Disable Comment Area' : 'Enable Comment Area'}
                  </button>
                </div>
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
