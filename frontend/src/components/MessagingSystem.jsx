import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Send,
  Chat,
  Circle,
  MoreVert,
  Person,
  Close
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

// Message Bubble Component
const MessageBubble = ({ message, isOwn, senderName }) => {
  return (
    <Box
      display="flex"
      justifyContent={isOwn ? "flex-end" : "flex-start"}
      mb={1}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '70%',
          backgroundColor: isOwn ? 'primary.main' : 'grey.100',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
        }}
      >
        {!isOwn && (
          <Typography variant="caption" display="block" sx={{ mb: 0.5, opacity: 0.8 }}>
            {senderName}
          </Typography>
        )}
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {message.content}
        </Typography>
        <Typography 
          variant="caption" 
          display="block" 
          sx={{ mt: 0.5, opacity: 0.7, textAlign: 'right' }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {isOwn && (
            <Circle 
              sx={{ 
                ml: 0.5, 
                fontSize: 8, 
                color: message.isRead ? 'success.main' : 'grey.500' 
              }} 
            />
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

// Conversation Item Component
const ConversationItem = ({ conversation, onClick, isSelected }) => {
  const { partner, lastMessage } = conversation;
  const isUnread = !lastMessage.isRead && lastMessage.toUserId === partner.id;

  return (
    <ListItem
      button
      onClick={onClick}
      selected={isSelected}
      sx={{
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <ListItemAvatar>
        <Badge
          color="error"
          variant="dot"
          invisible={!isUnread}
        >
          <Avatar>
            {partner.firstName?.[0] || partner.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="subtitle2" 
              sx={{ fontWeight: isUnread ? 'bold' : 'normal' }}
            >
              {partner.firstName && partner.lastName 
                ? `${partner.firstName} ${partner.lastName}`
                : partner.email
              }
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(lastMessage.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        }
        secondary={
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontWeight: isUnread ? 'bold' : 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {lastMessage.content}
          </Typography>
        }
      />
    </ListItem>
  );
};

// New Message Dialog Component
const NewMessageDialog = ({ open, onClose, onSent }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!recipientEmail || !message) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Note: In a real implementation, you'd need to get the user ID from email
      // For now, we'll assume you have the recipient's user ID
      await axiosInstance.post('/api/messages', {
        toUserId: recipientEmail, // This should be the actual user ID
        content: message.trim()
      });

      setRecipientEmail('');
      setMessage('');
      onClose();
      if (onSent) onSent();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Message</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          fullWidth
          label="Recipient Email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Enter recipient's email"
        />
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          inputProps={{ maxLength: 2000 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !recipientEmail || !message}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Chat Component
const ChatWindow = ({ selectedConversation, currentUserId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get(
        `/api/messages/conversation/${selectedConversation.partner.id}`
      );
      setMessages(response.data || []);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    const messageToSend = newMessage.trim();
    setNewMessage('');

    try {
      const response = await axiosInstance.post('/api/messages', {
        toUserId: selectedConversation.partner.id,
        content: messageToSend
      });

      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      setError('Failed to send message');
      setNewMessage(messageToSend); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedConversation) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        height="100%" 
        color="text.secondary"
      >
        <Box textAlign="center">
          <Chat sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">Select a conversation to start messaging</Typography>
        </Box>
      </Box>
    );
  }

  const { partner } = selectedConversation;

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Chat Header */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderRadius: 0
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={onBack} sx={{ display: { md: 'none' } }}>
            <Close />
          </IconButton>
          <Avatar>
            {partner.firstName?.[0] || partner.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">
              {partner.firstName && partner.lastName 
                ? `${partner.firstName} ${partner.lastName}`
                : partner.email
              }
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {partner.email}
            </Typography>
          </Box>
        </Box>
        <IconButton>
          <MoreVert />
        </IconButton>
      </Paper>

      {/* Messages Area */}
      <Box 
        flex={1} 
        overflow="auto" 
        p={2}
        sx={{ backgroundColor: 'grey.50' }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {messages.length === 0 ? (
              <Box textAlign="center" color="text.secondary" mt={4}>
                <Typography>No messages yet. Start the conversation!</Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.fromUserId === currentUserId}
                  senderName={
                    message.fromUserId === currentUserId 
                      ? 'You'
                      : (partner.firstName || partner.email)
                  }
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 2, 
          alignItems: 'flex-end',
          borderRadius: 0 
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          inputProps={{ maxLength: 2000 }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          startIcon={sending ? <CircularProgress size={20} /> : <Send />}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          {sending ? '' : 'Send'}
        </Button>
      </Paper>
    </Box>
  );
};

// Main Messaging Component
export const MessagingSystem = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState('');

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user_id);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/api/messages/conversations');
      setConversations(response.data || []);
    } catch (error) {
      setError('Failed to load conversations');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleNewMessageSent = () => {
    fetchConversations();
    setShowNewMessage(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box height="70vh" display="flex">
      {/* Conversations List */}
      <Paper 
        sx={{ 
          width: { xs: '100%', md: 300 }, 
          display: { xs: selectedConversation ? 'none' : 'block', md: 'block' },
          borderRadius: 0,
          borderRight: { md: 1 },
          borderColor: { md: 'divider' }
        }}
      >
        <Box p={2} borderBottom={1} borderColor="divider">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Messages</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Chat />}
              onClick={() => setShowNewMessage(true)}
            >
              New
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        <List sx={{ p: 0 }}>
          {conversations.length === 0 ? (
            <Box p={3} textAlign="center" color="text.secondary">
              <Typography>No conversations yet</Typography>
            </Box>
          ) : (
            conversations.map((conversation, index) => (
              <React.Fragment key={conversation.partner.id}>
                <ConversationItem
                  conversation={conversation}
                  onClick={() => setSelectedConversation(conversation)}
                  isSelected={selectedConversation?.partner.id === conversation.partner.id}
                />
                {index < conversations.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Chat Window */}
      <Box 
        flex={1} 
        sx={{ 
          display: { xs: selectedConversation ? 'flex' : 'none', md: 'flex' } 
        }}
      >
        <ChatWindow
          selectedConversation={selectedConversation}
          currentUserId={currentUserId}
          onBack={() => setSelectedConversation(null)}
        />
      </Box>

      {/* New Message Dialog */}
      <NewMessageDialog
        open={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        onSent={handleNewMessageSent}
      />
    </Box>
  );
};

export default MessagingSystem;