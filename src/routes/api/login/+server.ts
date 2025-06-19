import { initialUsers } from '$lib/server/usersData';
import type { RequestHandler } from '@sveltejs/kit';
import type { User } from '../../../stores/types';

export const POST: RequestHandler = async ({ request }) => {
  const { login, password } = await request.json();
  // Nettoyage du login
  const cleanLogin = typeof login === 'string' ? login.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  // Log côté serveur (pour debug, à retirer en prod)
  console.log('Tentative de connexion:', { login, password, cleanLogin, cleanPassword });

  // Recherche utilisateur (login insensible à la casse)
  const user = initialUsers.find((u: User) => u.login.toLowerCase() === cleanLogin);

  console.log('Utilisateur trouvé:', user);
  if (user) {
    console.log('Comparaison des mots de passe:', { attendu: user.password, recu: cleanPassword, egal: user.password === cleanPassword });
  }

  if (!user) {
    return new Response(JSON.stringify({ success: false, message: 'Login inconnu' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (user.password !== cleanPassword) {
    return new Response(JSON.stringify({ success: false, message: 'Mot de passe incorrect' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  return new Response(JSON.stringify({ success: true, user: userWithoutPassword }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
