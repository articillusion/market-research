import React, { useEffect, useState } from 'react';
import { Box, Button, Container, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export type QuestionType = 'SingleChoice' | 'MultiChoice' | 'OpenText' | 'RatingScale' | 'ScreenOut' | 'Netting' | 'Matrix' | 'Slider' | 'Dropdown' | 'Date' | 'FileUpload';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: { label: string; value: string }[];
  logic?: { type: string; condition: string; targetId?: string }[];
  labels?: string[];
  commentArea?: boolean;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface SurveyDraft {
  id: string;
  title: string;
  clientName: string;
  sections: Section[];
  createdByUserId?: string;
  language?: string;
}

interface DraggableItemProps {
  id: string;
  index: number;
  type: 'SECTION' | 'QUESTION';
  moveItem: (dragIndex: number, hoverIndex: number, type: 'SECTION' | 'QUESTION') => void;
  children: React.ReactNode;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, index, type, moveItem, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: type,
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        moveItem(item.index, index, type);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {children}
    </div>
  );
};

export const QuestionnaireBuilder: React.FC<{ initial?: SurveyDraft }> = ({ initial }) => {
  const [draft, setDraft] = useState<SurveyDraft>(
    initial || {
      id: uuidv4(),
      title: 'Untitled study',
      clientName: '',
      language: 'en-US',
      sections: [{ id: 'sec-1', title: 'Section 1', questions: [] }],
    }
  );
  const [editingQuestion, setEditingQuestion] = useState<{ sectionId: string; questionId?: string } | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [loading, setLoading] = useState(false);

  const moveItem = (dragIndex: number, hoverIndex: number, type: 'SECTION' | 'QUESTION', sectionId?: string) => {
    setDraft((prev) => {
      if (type === 'SECTION') {
        const sections = [...prev.sections];
        const [moved] = sections.splice(dragIndex, 1);
        sections.splice(hoverIndex, 0, moved);
        return { ...prev, sections };
      } else {
        const sections = prev.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                questions: [...s.questions],
              }
            : s
        );
        const section = sections.find((s) => s.id === sectionId)!;
        const [moved] = section.questions.splice(dragIndex, 1);
        section.questions.splice(hoverIndex, 0, moved);
        return { ...prev, sections };
      }
    });
  };

  const addQuestion = (sectionId: string) => {
    const q: Question = { id: uuidv4(), type: 'SingleChoice', text: 'New question', options: [] };
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === sectionId ? { ...s, questions: [...s.questions, q] } : s)),
    }));
    setEditingQuestion({ sectionId, questionId: q.id });
    setNewQuestionText('');
  };

  const updateQuestion = (sectionId: string, questionId: string, patch: Partial<Question>) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)) }
          : s
      ),
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === sectionId ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) } : s)),
    }));
  };

  const saveDraft = async () => {
    setLoading(true);
    try {
      await axios.post('/api/save', draft);
    } catch (err) {
      console.error('save failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setInterval(() => {
      saveDraft();
    }, 30000);
    return () => clearInterval(t);
  }, [draft]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth="md" dir={draft.language === 'ar' ? 'rtl' : 'ltr'} role="region" aria-label="Questionnaire Builder">
        <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <Typography variant="h5">{draft.title}</Typography>
          <Button variant="contained" onClick={saveDraft} disabled={loading} aria-label="Save draft">
            Save Draft
          </Button>
        </Box>

        <TextField
          label="Client name"
          fullWidth
          margin="normal"
          value={draft.clientName}
          onChange={(e) => setDraft((d) => ({ ...d, clientName: e.target.value }))}
          inputProps={{ maxLength: 100 }}
          aria-required
        />

        <List>
          {draft.sections.map((s, sIndex) => (
            <DraggableItem
              key={s.id}
              id={s.id}
              index={sIndex}
              type="SECTION"
              moveItem={(dragIndex, hoverIndex) => moveItem(dragIndex, hoverIndex, 'SECTION')}
            >
              <Box my={2} p={2} border="1px solid #eee" borderRadius={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <DragIndicatorIcon sx={{ cursor: 'grab', mr: 1 }} aria-hidden />
                    <Typography variant="h6">{s.title}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => addQuestion(s.id)} aria-label={`Add question to ${s.title}`}>
                    <AddIcon />
                  </IconButton>
                </Box>

                <List>
                  {s.questions.map((q, qIndex) => (
                    <DraggableItem
                      key={q.id}
                      id={q.id}
                      index={qIndex}
                      type="QUESTION"
                      moveItem={(dragIndex, hoverIndex) => moveItem(dragIndex, hoverIndex, 'QUESTION', s.id)}
                    >
                      <ListItem divider>
                        <Box display="flex" alignItems="center" width="100%">
                          <DragIndicatorIcon sx={{ cursor: 'grab', mr: 1 }} aria-hidden />
                          <ListItemText
                            primary={
                              editingQuestion?.questionId === q.id ? (
                                <TextField
                                  value={newQuestionText || q.text}
                                  onChange={(e) => setNewQuestionText(e.target.value)}
                                  onBlur={() => {
                                    updateQuestion(s.id, q.id, { text: newQuestionText || q.text });
                                    setEditingQuestion(null);
                                  }}
                                  autoFocus
                                  fullWidth
                                  variant="standard"
                                  inputProps={{ maxLength: 500, 'aria-label': 'Edit question text' }}
                                />
                              ) : (
                                <span
                                  onDoubleClick={() => {
                                    setEditingQuestion({ sectionId: s.id, questionId: q.id });
                                    setNewQuestionText(q.text);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      setEditingQuestion({ sectionId: s.id, questionId: q.id });
                                      setNewQuestionText(q.text);
                                    }
                                  }}
                                >
                                  {q.text}
                                </span>
                              )
                            }
                            secondary={q.type}
                          />
                          <Button onClick={() => setEditingQuestion({ sectionId: s.id, questionId: q.id })} aria-label={`Edit question ${q.text}`}>
                            Edit
                          </Button>
                          <Button
                            color="error"
                            onClick={() => deleteQuestion(s.id, q.id)}
                            aria-label={`Delete question ${q.text}`}
                          >
                            Delete
                          </Button>
                        </Box>
                      </ListItem>
                    </DraggableItem>
                  ))}
                </List>
              </Box>
            </DraggableItem>
          ))}
        </List>
      </Container>
    </DndProvider>
  );
};
