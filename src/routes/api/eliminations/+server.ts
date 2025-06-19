import { gameState } from '$lib/server/gameState';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { playerLogin, source, reason, details } = await request.json();
  const elimination = {
    playerLogin,
    source,
    reason,
    timestamp: Date.now(),
    details
  };
  if (!gameState.eliminations) gameState.eliminations = [];
  (gameState.eliminations as any[]).push(elimination);
  return new Response(JSON.stringify({ success: true, newState: gameState }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
