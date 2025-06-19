import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async () => {
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
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
