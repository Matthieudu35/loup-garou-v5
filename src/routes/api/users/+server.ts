import { initialUsers } from '$lib/server/usersData';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  // On retire le champ password de chaque utilisateur
  const publicUsers = initialUsers.map(({ password, ...user }) => user);
  return new Response(JSON.stringify(publicUsers), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
