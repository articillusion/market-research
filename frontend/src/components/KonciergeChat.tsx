import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'koncierge';
}

export const KonciergeChat: React.FC<{ surveyId: string; onUpdateSurvey: (survey: any) => void }> = ({
  surveyId,
  onUpdateSurvey,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: uuidv4(), text: 'Hello! I’m Koncierge, your assistant for drafting questionnaires. Upload a SOW/Proposal or describe your study to start.', sender: 'koncierge' },
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!input && !file) return;
    const userMessage: Message = { id: uuidv4(), text: input || 'File uploaded', sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', input);
      formData.append('surveyId', surveyId);
      if (file) formData.append('sowFile', file);

      const response = await aiService.interactWithKoncierge(surveyId, formData);
      const konciergeMessage: Message = {
        id: uuidv4(),
        text: response.message || 'I’ve processed your input. Here’s an updated draft.',
        sender: 'koncierge',
      };
      setMessages((prev) => [...prev, konciergeMessage]);

      if (response.survey) {
        onUpdateSurvey(response.survey);
      }
    } catch (err) {
      const errorMessage: Message = {
        id: uuidv4(),
        text: 'Sorry, I couldn’t process that. Try again or contact support.',
        sender: 'koncierge',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setInput('');
      setFile(null);
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxHeight: '400px', overflow: 'auto', mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Koncierge Assistant
      </Typography>
      <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
        {messages.map((msg) => (
          <ListItem key={msg.id} sx={{ flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
            <ListItemText
              primary={msg.text}
              sx={{
                bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.200',
                p: 1,
                borderRadius: 2,
                maxWidth: '80%',
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box display="flex" mt={2}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Koncierge or describe your study..."
          disabled={loading}
          inputProps={{ maxLength: 1000, 'aria-label': 'Chat with Koncierge' }}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={loading} aria-label="Upload SOW or Proposal">
          Upload
        </Button>
        <Button onClick={sendMessage} disabled={loading || (!input && !file)} aria-label="Send message">
          Send
        </Button>
      </Box>
    </Paper>
  );
};
