import express from 'express';
import cors from 'cors';
import { handler } from './build/handler.js';
import { initialUsers } from './src/stores/usersData';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Types
const EliminationSource = {
  ADMIN: 'admin',
  VOTE: 'vote',
  LOUP_GAROU: 'loup-garou',
  SORCIERE: 'sorcière',
  CHASSEUR: 'chasseur',
  OTHER: 'other'
};

// État initial du jeu
let gameState = {
  phase: 'nuit',
  cycleCount: 0,
  showMayorElection: null,
  mayor: null,
  gameStarted: false,
  showSecondRoundAnnouncement: false,
  showVoteCountdown: false,
  joueurs: [],
  roles: [],
  timer: 3600,
  subTimers: {},
  eliminations: [],
  enfantSauvageStates: {},
  chienLoupStates: {},
  dayVotes: {},
  isSecondRound: false
};

// Endpoint pour obtenir l'état complet du jeu
app.get('/state', (req, res) => {
  res.json(gameState);
});

// Endpoint pour mettre à jour l'état du jeu
app.post('/state', (req, res) => {
  gameState = { ...gameState, ...req.body };
  res.json({ success: true, newState: gameState });
});

// Endpoint pour démarrer une nouvelle partie
app.post('/start', (req, res) => {
  gameState = {
    ...gameState,
    phase: 'nuit',
    cycleCount: 0,
    gameStarted: true,
    showMayorElection: null,
    mayor: null,
    timer: 3600,
    subTimers: {},
    eliminations: [],
    enfantSauvageStates: {},
    chienLoupStates: {},
    dayVotes: {},
    isSecondRound: false
  };
  res.json({ success: true, newState: gameState });
});

// Endpoint pour réinitialiser la partie
app.post('/reset', (req, res) => {
  gameState = {
    phase: 'nuit',
    cycleCount: 0,
    gameStarted: false,
    showMayorElection: null,
    mayor: null,
    showSecondRoundAnnouncement: false,
    showVoteCountdown: false,
    joueurs: [],
    roles: [],
    timer: 3600,
    subTimers: {},
    eliminations: [],
    enfantSauvageStates: {},
    chienLoupStates: {},
    dayVotes: {},
    isSecondRound: false
  };
  res.json({ success: true, newState: gameState });
});

// Endpoint pour gérer les timers
app.post('/timer', (req, res) => {
  const { timer, subTimers } = req.body;
  gameState = {
    ...gameState,
    timer: timer || gameState.timer,
    subTimers: subTimers || gameState.subTimers
  };
  res.json({ success: true, newState: gameState });
});

// Endpoint pour gérer les éliminations
app.post('/eliminations', (req, res) => {
  const { playerLogin, source, reason, details } = req.body;
  const elimination = {
    playerLogin,
    source,
    reason,
    timestamp: Date.now(),
    details
  };
  gameState.eliminations.push(elimination);
  res.json({ success: true, newState: gameState });
});

// Endpoint pour gérer les votes du jour
app.post('/dayVotes', (req, res) => {
  const { voter, target } = req.body;
  gameState.dayVotes[voter] = target;
  res.json({ success: true, newState: gameState });
});

// Endpoint pour gérer l'état de l'enfant sauvage
app.post('/enfantSauvage', (req, res) => {
  const { login, masterLogin, hasSwitched } = req.body;
  gameState.enfantSauvageStates[login] = { masterLogin, hasSwitched };
  res.json({ success: true, newState: gameState });
});

// Endpoint pour gérer l'état du chien-loup
app.post('/chienLoup', (req, res) => {
  const { login, camp, hasChosen } = req.body;
  gameState.chienLoupStates[login] = { camp, hasChosen };
  res.json({ success: true, newState: gameState });
});

// Endpoint pour gérer les rôles
app.post('/roles', (req, res) => {
  const { roles } = req.body;
  gameState.roles = roles;
  res.json({ success: true, newState: gameState });
});

// Endpoint pour gérer les joueurs
app.post('/players', (req, res) => {
  const { players } = req.body;
  gameState.joueurs = players;
  res.json({ success: true, newState: gameState });
});

// Endpoint d'authentification
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  const user = initialUsers.find(u => u.login === login && u.password === password);
  if (user) {
    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  }
});

// **Très important :** placer l'intégration Svelte **après** toutes les routes API
app.use(handler);

app.listen(port, () => console.log(`🎮 Loup-Garou backend is running on port ${port}`));
