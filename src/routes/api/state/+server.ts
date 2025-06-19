import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify(gameState), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  Object.assign(gameState, body);
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
