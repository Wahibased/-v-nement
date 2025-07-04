import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Container, Typography, TextField, Button, Box, Snackbar, Alert, CircularProgress,
  ToggleButton, ToggleButtonGroup, Grid, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, IconButton, MenuItem, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event'; // Unused import, can be removed if not used elsewhere
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NoteIcon from '@mui/icons-material/Note';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineContent, TimelineConnector } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';


// Access the environment variable set in Vercel
// Ensure VITE_API_URL is correctly configured in your .env.production and .env files in the frontend root
// For local development, you might have VITE_API_URL=http://localhost:5000 in .env
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Fallback for local development

function EventAppIcon({ profileUrl, onChangeProfile }) {
  const fileInputRef = useRef(null);
  const handleIconClick = () => fileInputRef.current?.click();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        onChangeProfile(base64data);
        localStorage.setItem('profilePictureUrl', base64data);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div>
      <img
        src={profileUrl || 'https://via.placeholder.com/100'}
        alt="Profile"
        style={{ width: '100px', height: '100px', cursor: 'pointer', borderRadius: '50%' }}
        onClick={handleIconClick}
      />
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}

function PersonalNote({ open, onClose }) {
  const [note, setNote] = useState(localStorage.getItem('personalNote') || '');
  const [paperStyle, setPaperStyle] = useState(localStorage.getItem('notePaperStyle') || 'white');

  useEffect(() => {
    // Save note and style to localStorage when component unmounts or dependencies change
    return () => {
      localStorage.setItem('personalNote', note);
      localStorage.setItem('notePaperStyle', paperStyle);
    };
  }, [note, paperStyle]);

  const paperOptions = {
    white: { backgroundColor: '#fff', color: '#000', fontFamily: 'Arial, sans-serif' },
    beige: { backgroundColor: '#f5f1e9', color: '#5a4a3e', fontFamily: "'Comic Sans MS', cursive" },
    blue: { backgroundColor: '#e6f0fa', color: '#13396a', fontFamily: "'Courier New', Courier, monospace" },
    pink: { backgroundColor: '#fce4ec', color: '#880e4f', fontFamily: "'Georgia', serif" },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Note personnelle
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Select value={paperStyle} onChange={(e) => setPaperStyle(e.target.value)} fullWidth sx={{ mb: 2 }}>
          <MenuItem value="white">Papier blanc</MenuItem>
          <MenuItem value="beige">Papier beige</MenuItem>
          <MenuItem value="blue">Papier bleu</MenuItem>
          <MenuItem value="pink">Papier rose</MenuItem>
        </Select>
        <TextField
          multiline
          rows={10}
          fullWidth
          variant="outlined"
          placeholder="Écrivez votre note ici..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ ...paperOptions[paperStyle], p: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

function CalendarDialog({ open, onClose }) {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Calendrier</DialogTitle>
      <DialogContent>
        <TextField
          label="Sélectionner une date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}


export default function Events() {
  const [user, setUser] = useState({ name: '', email: '', profilePictureUrl: '' });
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '' });
  const [editMode, setEditMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({ keyword: '', location: '', date: '' });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const today = dayjs().format('YYYY-MM-DD');

  // Function to handle profile picture change
  const handleChangeProfile = useCallback((newProfileUrl) => {
    setUser(prevUser => ({ ...prevUser, profilePictureUrl: newProfileUrl }));
  }, []);

  useEffect(() => {
    if (!token) return navigate('/login');

    try {
      // Decode token to get user info and check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() > payload.exp * 1000) { // Token expired
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        const storedProfileUrl = localStorage.getItem('profilePictureUrl');
        setUser({
          name: payload.name || 'Utilisateur',
          email: payload.email || '',
          profilePictureUrl: storedProfileUrl || payload.profilePictureUrl || '',
        });
      }
    } catch (e) {
      console.error("Token decoding failed or invalid token:", e);
      localStorage.removeItem('token'); // Clear invalid token
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${VITE_API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sort: sortOrder },
      });
      setEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
      setErrorMsg('Erreur lors de la récupération des événements');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await axios.put(`${VITE_API_URL}/api/events/${editMode}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMsg('Événement modifié.');
      } else {
        await axios.post(`${VITE_API_URL}/api/events`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMsg('Événement ajouté.');
      }
      fetchEvents();
      setDialogOpen(false);
      setForm({ title: '', date: '', location: '', description: '' });
      setEditMode(null);
    } catch (err) {
      console.error("Error saving event:", err.response?.data || err);
      setErrorMsg("Erreur lors de l'enregistrement : " + (err.response?.data?.message || err.message || ''));
    } finally {
      setSnackbarOpen(true);
    }
  };


  const filteredEvents = events.filter((e) => {
    const matchKeyword = e.title.toLowerCase().includes(filters.keyword.toLowerCase());
    const matchLocation = filters.location ? e.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
    const matchDate = filters.date ? dayjs(e.date).isSame(filters.date, 'day') : true;
    return matchKeyword && matchLocation && matchDate;
  });

  // Sort events by date
  const sortedAndFilteredEvents = [...filteredEvents].sort((a, b) => {
    const dateA = dayjs(a.date);
    const dateB = dayjs(b.date);
    if (sortOrder === 'asc') {
      return dateA.diff(dateB);
    } else {
      return dateB.diff(dateA);
    }
  });


  const todayEvents = sortedAndFilteredEvents.filter((e) => dayjs(e.date).isSame(today, 'day'));
  const upcomingEvents = sortedAndFilteredEvents.filter((e) => dayjs(e.date).isAfter(today, 'day'));
  const pastEvents = sortedAndFilteredEvents.filter((e) => dayjs(e.date).isBefore(today, 'day'));


  return (
    <Stack direction={{ xs: 'column', md: 'row' }} minHeight="100vh">
      <Box
        sx={{
          width: { xs: '100%', md: 250 },
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: { xs: 'auto', md: '100vh' }, // Adjust height for responsiveness
          position: 'relative',
          boxShadow: 3, // Add some shadow
        }}
      >
        <IconButton
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          sx={{ position: 'absolute', top: 10, right: 10 }}
        >
          <LogoutIcon />
        </IconButton>

        <div>
          <EventAppIcon profileUrl={user.profilePictureUrl} onChangeProfile={handleChangeProfile} />
          <Typography variant="h6" mt={1}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>

          <Stack spacing={4} mt={4}>
            <Button fullWidth variant="outlined" startIcon={<CalendarTodayIcon />} onClick={() => setCalendarOpen(true)}>
              Calendrier
            </Button>
            <Button fullWidth variant="outlined" startIcon={<NoteIcon />} onClick={() => setNoteOpen(true)}>
              Note personnelle
            </Button>
          </Stack>
        </div>

        <Box mt={2} sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={() => alert('Paramètres')} // Placeholder for actual settings
            sx={{ color: 'text.secondary' }}
            aria-label="paramètres"
            size="large"
          >
            <SettingsIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Paramètres
          </Typography>
        </Box>
      </Box>

      <Box flex={1} p={3}>
        <Container maxWidth="lg">
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <TextField label="Mot-clé" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} sx={{ flexGrow: 1 }} />
            <TextField label="Lieu" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} sx={{ flexGrow: 1 }} />
            <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} sx={{ flexGrow: 1 }} />
            <ToggleButtonGroup value={sortOrder} exclusive onChange={(e, value) => value && setSortOrder(value)}>
              <ToggleButton value="asc">Ascendant</ToggleButton>
              <ToggleButton value="desc">Descendant</ToggleButton>
            </ToggleButtonGroup>
            <Button onClick={() => setFilters({ keyword: '', location: '', date: '' })} variant="outlined">Réinitialiser</Button>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setDialogOpen(true)}>Ajouter</Button>
          </Box>

          <Typography variant="h6" mt={4}>Événements du jour ({todayEvents.length})</Typography>
          {todayEvents.length === 0 ? (
            <Typography sx={{ mb: 2 }}>Aucun événement prévu aujourd'hui.</Typography>
          ) : (
            <Timeline sx={{ my: 2, '&::before': { display: 'none' } }}> {/* Removed pseudo-element */}
              {todayEvents.map((event) => (
                <TimelineItem key={event._id}>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6">{event.title}</Typography>
                        <Typography color="text.secondary">{dayjs(event.date).format('DD/MM/YYYY')}</Typography>
                        <Typography>{event.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{event.location}</Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => {
                          setEditMode(event._id);
                          setForm({
                            title: event.title,
                            date: dayjs(event.date).format('YYYY-MM-DD'),
                            location: event.location,
                            description: event.description || '',
                          });
                          setDialogOpen(true);
                        }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={async () => {
                          try {
                            await axios.delete(`${VITE_API_URL}/api/events/${event._id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            setSuccessMsg('Événement supprimé.');
                            fetchEvents();
                          } catch (err) {
                            console.error("Error deleting event:", err.response?.data || err);
                            setErrorMsg("Erreur lors de la suppression.");
                          } finally {
                            setSnackbarOpen(true);
                          }
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}

          <Typography variant="h6" mt={4}>Événements à venir ({upcomingEvents.length})</Typography>
          {upcomingEvents.length === 0 ? (
            <Typography sx={{ mb: 2 }}>Aucun événement à venir.</Typography>
          ) : (
            <Grid container spacing={2} mt={1}>
              {upcomingEvents.map((event) => (
                <Grid item xs={12} md={6} key={event._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{event.title}</Typography>
                      <Typography color="text.secondary">{dayjs(event.date).format('DD/MM/YYYY')}</Typography>
                      <Typography>{event.description}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.location}</Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => {
                        setEditMode(event._id);
                        setForm({
                          title: event.title,
                          date: dayjs(event.date).format('YYYY-MM-DD'),
                          location: event.location,
                          description: event.description || '',
                        });
                        setDialogOpen(true);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={async () => {
                        try {
                          await axios.delete(`${VITE_API_URL}/api/events/${event._id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          setSuccessMsg('Événement supprimé.');
                          fetchEvents();
                        } catch (err) {
                          console.error("Error deleting event:", err.response?.data || err);
                          setErrorMsg("Erreur lors de la suppression.");
                        } finally {
                          setSnackbarOpen(true);
                        }
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Typography variant="h6" mt={4}>Événements passés ({pastEvents.length})</Typography>
          {pastEvents.length === 0 ? (
            <Typography sx={{ mb: 2 }}>Aucun événement passé.</Typography>
          ) : (
            <Grid container spacing={2} mt={1}>
              {pastEvents.map((event) => (
                <Grid item xs={12} md={6} key={event._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{event.title}</Typography>
                      <Typography color="text.secondary">{dayjs(event.date).format('DD/MM/YYYY')}</Typography>
                      <Typography>{event.description}</Typography>
                      <Typography variant="caption" color="text.secondary">{event.location}</Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => {
                        setEditMode(event._id);
                        setForm({
                          title: event.title,
                          date: dayjs(event.date).format('YYYY-MM-DD'),
                          location: event.location,
                          description: event.description || '',
                        });
                        setDialogOpen(true);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={async () => {
                        try {
                          await axios.delete(`${VITE_API_URL}/api/events/${event._id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          setSuccessMsg('Événement supprimé.');
                          fetchEvents();
                        } catch (err) {
                          console.error("Error deleting event:", err.response?.data || err);
                          setErrorMsg("Erreur lors de la suppression.");
                        } finally {
                          setSnackbarOpen(true);
                        }
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditMode(null); setForm({ title: '', date: '', location: '', description: '' }); }}>
            <DialogTitle>{editMode ? 'Modifier l\'événement' : 'Ajouter un événement'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Titre"
                name="title"
                fullWidth
                variant="standard"
                value={form.title}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Date"
                name="date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="standard"
                value={form.date}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Lieu"
                name="location"
                fullWidth
                variant="standard"
                value={form.location}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Description"
                name="description"
                multiline
                rows={3}
                fullWidth
                variant="standard"
                value={form.description}
                onChange={handleChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setDialogOpen(false); setEditMode(null); setForm({ title: '', date: '', location: '', description: '' }); }}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} variant="contained">
                {editMode ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogActions>
          </Dialog>

          <CalendarDialog open={calendarOpen} onClose={() => setCalendarOpen(false)} />
          <PersonalNote open={noteOpen} onClose={() => setNoteOpen(false)} />

          <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
            {errorMsg ? (
              <Alert severity="error" onClose={() => setSnackbarOpen(false)}>{errorMsg}</Alert>
            ) : (
              <Alert severity="success" onClose={() => setSnackbarOpen(false)}>{successMsg}</Alert>
            )}
          </Snackbar>
        </Container>
      </Box>
    </Stack>
  );
}