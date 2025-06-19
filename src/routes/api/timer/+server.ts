import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { timer, subTimers } = await request.json();
  if (timer !== undefined) gameState.timer = timer;
  if (subTimers !== undefined) gameState.subTimers = subTimers;
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
