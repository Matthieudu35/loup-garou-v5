import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { login, masterLogin, hasSwitched } = await request.json();
  if (!gameState.enfantSauvageStates) gameState.enfantSauvageStates = {};
  (gameState.enfantSauvageStates as Record<string, any>)[login] = { masterLogin, hasSwitched };
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
