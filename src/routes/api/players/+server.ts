import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { players } = await request.json();
  gameState.joueurs = players;
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
