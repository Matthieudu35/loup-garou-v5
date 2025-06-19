import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { voter, target } = await request.json();
  if (!gameState.dayVotes) gameState.dayVotes = {};
  (gameState.dayVotes as Record<string, any>)[voter] = target;
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
