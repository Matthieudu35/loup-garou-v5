export let gameState = {
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

export function resetGameState() {
  Object.assign(gameState, {
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
  });
}

export function startGameState() {
  Object.assign(gameState, {
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
  });
}

export function updateGameState(update: Partial<typeof gameState>) {
  Object.assign(gameState, update);
}
