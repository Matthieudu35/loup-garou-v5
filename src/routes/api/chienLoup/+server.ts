import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { login, camp, hasChosen } = await request.json();
  if (!gameState.chienLoupStates) gameState.chienLoupStates = {};
  (gameState.chienLoupStates as Record<string, any>)[login] = { camp, hasChosen };
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
