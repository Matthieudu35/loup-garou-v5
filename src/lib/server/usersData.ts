// src/stores/usersData.ts
import type { User } from '../../stores/types';

export const initialUsers: User[] = [
  {
    login: 'admin',
    password: 'adminpass',
    firstName: 'Admin',
    lastName: '',
    photoUrl: '',
    isAlive: true,
    isAdmin: true
  },
  {
    login: 'mbebin',
    password: '27072001',
    firstName: 'Manon',
    lastName: 'Bebin',
    photoUrl: '/photos/mbebin.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'rbienvenu',
    password: '31101998',
    firstName: 'Rose',
    lastName: 'Bienvenu',
    photoUrl: '/photos/rbienvenu.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'jbontemps',
    password: '24012001',
    firstName: 'Jazz',
    lastName: 'Bontemps',
    photoUrl: '/photos/jbontemps.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'cboudier',
    password: '23082001',
    firstName: 'Claire',
    lastName: 'Boudier',
    photoUrl: '/photos/cboudier.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'lboudinot',
    password: '23092003',
    firstName: 'Lou',
    lastName: 'Boudinot',
    photoUrl: '/photos/lboudinot.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'ibracq',
    password: '22092001',
    firstName: 'Ines',
    lastName: 'Bracq',
    photoUrl: '/photos/ibracq.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'cbrionne',
    password: '16052001',
    firstName: 'Charles',
    lastName: 'Brionne',
    photoUrl: '/photos/cbrionne.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'pburgot',
    password: '04042001',
    firstName: 'Paul',
    lastName: 'Burgot',
    photoUrl: '/photos/pburgot.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'jcabioch',
    password: '15062000',
    firstName: 'Jonas',
    lastName: 'Cabioch',
    photoUrl: '/photos/jcabioch.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mcamus',
    password: '04102001',
    firstName: 'Mathieu',
    lastName: 'Camus',
    photoUrl: '/photos/mcamus.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'lchabaud',
    password: '14101998',
    firstName: 'Leonie',
    lastName: 'Chabaud',
    photoUrl: '/photos/lchabaud.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'gchauvin',
    password: '28092002',
    firstName: 'Garance',
    lastName: 'Chauvin',
    photoUrl: '/photos/gchauvin.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'pchayer',
    password: '19011999',
    firstName: 'Pierre-Louis',
    lastName: 'Chayer',
    photoUrl: '/photos/pchayer.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'acollet',
    password: '26071995',
    firstName: 'Antoine',
    lastName: 'Collet',
    photoUrl: '/photos/acollet.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'tcollet',
    password: '31101996',
    firstName: 'Thibault',
    lastName: 'Collet',
    photoUrl: '/photos/tcollet.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mcollet',
    password: '19062000',
    firstName: 'Matthieu',
    lastName: 'Collet',
    photoUrl: '/photos/mcollet.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'lcontessa',
    password: '13071999',
    firstName: 'Laetitia',
    lastName: 'Contessa',
    photoUrl: '/photos/lcontessa.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'lcoupe',
    password: '08052000',
    firstName: 'Léna',
    lastName: 'Coupé',
    photoUrl: '/photos/lcoupe.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'bcourtel',
    password: '09062000',
    firstName: 'Brieuc',
    lastName: 'Courtel',
    photoUrl: '/photos/bcourtel.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'ldagni',
    password: '30112000',
    firstName: 'Lancelot',
    lastName: 'Dagni',
    photoUrl: '/photos/ldagni.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'qdehed',
    password: '19112001',
    firstName: 'Quitterie',
    lastName: 'De hed',
    photoUrl: '/photos/qdehed.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'jdeslongchamps',
    password: '22051999',
    firstName: 'Jean',
    lastName: 'Des Longchamps',
    photoUrl: '/photos/jdeslongchamps.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'bdesalin',
    password: '10042001',
    firstName: 'Brieuc',
    lastName: 'de Salin',
    photoUrl: '/photos/bdesalin.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'bdelanoix',
    password: '16022001',
    firstName: 'Blandine',
    lastName: 'Delanoix',
    photoUrl: '/photos/bdelanoix.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mdelatullay',
    password: '15102002',
    firstName: 'Marguerite',
    lastName: 'Delatullay',
    photoUrl: '/photos/mdelatullay.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'ldemag',
    password: '08111999',
    firstName: 'Louis',
    lastName: 'Demag',
    photoUrl: '/photos/ldemag.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'fdestrem',
    password: '20102001',
    firstName: 'Flore',
    lastName: 'Destrem',
    photoUrl: '/photos/fdestrem.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'cdevi',
    password: '15092001',
    firstName: 'Constantin',
    lastName: 'Devi',
    photoUrl: '/photos/cdevi.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'idevi',
    password: '08102001',
    firstName: 'Isaure',
    lastName: 'Devi',
    photoUrl: '/photos/idevi.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mguillemard',
    password: '14042001',
    firstName: 'Matthias',
    lastName: 'Guillemard',
    photoUrl: '/photos/mguillemard.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'gwascoz',
    password: '23092000',
    firstName: 'Gwenola',
    lastName: 'Gwascoz',
    photoUrl: '/photos/gwascoz.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'lherve',
    password: '27102000',
    firstName: 'Lucie hv',
    lastName: 'Herve',
    photoUrl: '/photos/lherve.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'jhervieu',
    password: '12062001',
    firstName: 'Julie',
    lastName: 'Hervieu',
    photoUrl: '/photos/jhervieu.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'theurtault',
    password: '01021999',
    firstName: 'Timothée',
    lastName: 'Heurtault',
    photoUrl: '/photos/theurtault.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'hjeanjean',
    password: '02121999',
    firstName: 'Henriette',
    lastName: 'Jeanjean',
    photoUrl: '/photos/hjeanjean.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mkovalenko',
    password: '14102000',
    firstName: 'Marie',
    lastName: 'Kovalenko',
    photoUrl: '/photos/mkovalenko.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'ecamus',
    password: '19112000',
    firstName: 'Emma',
    lastName: 'Le Camus',
    photoUrl: '/photos/ecamus.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'nlegree',
    password: '13082001',
    firstName: 'Noa',
    lastName: 'Le grée',
    photoUrl: '/photos/nlegree.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'slebot',
    password: '16072000',
    firstName: 'Sebastien',
    lastName: 'Lebot',
    photoUrl: '/photos/slebot.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'aliebard',
    password: '07102001',
    firstName: 'Audrey',
    lastName: 'Liebard',
    photoUrl: '/photos/aliebard.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'cliebard',
    password: '21022004',
    firstName: 'Clement',
    lastName: 'Liebard',
    photoUrl: '/photos/cliebard.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'fmahe',
    password: '31012000',
    firstName: 'François',
    lastName: 'Mahé',
    photoUrl: '/photos/fmahe.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'kmanach',
    password: '17032001',
    firstName: 'Killian',
    lastName: 'Manach',
    photoUrl: '/photos/kmanach.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'pmarquet',
    password: '11122002',
    firstName: 'Petula',
    lastName: 'Marquet',
    photoUrl: '/photos/pmarquet.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'bmartinier',
    password: '13062000',
    firstName: 'Bertille',
    lastName: 'Martinier',
    photoUrl: '/photos/bmartinier.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'rmaz',
    password: '28021999',
    firstName: 'Raphael',
    lastName: 'maz',
    photoUrl: '/photos/rmaz.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'cmonnier',
    password: '24102001',
    firstName: 'Clemence',
    lastName: 'monnier',
    photoUrl: '/photos/cmonnier.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mmosset',
    password: '20032001',
    firstName: 'Marthe',
    lastName: 'Mosset',
    photoUrl: '/photos/mmosset.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'emust',
    password: '07042001',
    firstName: 'Emeric',
    lastName: 'Must',
    photoUrl: '/photos/emust.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'lnedelec',
    password: '09112000',
    firstName: 'Lucie',
    lastName: 'Nedelec',
    photoUrl: '/photos/lnedelec.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'npaquet',
    password: '19111998',
    firstName: 'Noémie',
    lastName: 'Paquet',
    photoUrl: '/photos/npaquet.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'fpavy',
    password: '17102001',
    firstName: 'François',
    lastName: 'Pavy',
    photoUrl: '/photos/fpavy.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'jpenhard',
    password: '13052002',
    firstName: 'Jules',
    lastName: 'Penhard',
    photoUrl: '/photos/jpenhard.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'aporte',
    password: '05022001',
    firstName: 'Antoine',
    lastName: 'Porte',
    photoUrl: '/photos/aporte.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'aprima',
    password: '06102001',
    firstName: 'Anna',
    lastName: 'Prima',
    photoUrl: '/photos/aprima.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'arapenau',
    password: '06082002',
    firstName: 'Alexandra',
    lastName: 'Rapenau',
    photoUrl: '/photos/arapenau.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'predier',
    password: '24082000',
    firstName: 'Pauline',
    lastName: 'Redier',
    photoUrl: '/photos/predier.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'preigner',
    password: '20092002',
    firstName: 'Pauline',
    lastName: 'Reigner',
    photoUrl: '/photos/preigner.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'cricollo',
    password: '19062001',
    firstName: 'Cécile',
    lastName: 'Ricollo',
    photoUrl: '/photos/cricollo.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mrivoal',
    password: '13122001',
    firstName: 'Marie',
    lastName: 'Rivoal',
    photoUrl: '/photos/mrivoal.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'mrouault',
    password: '20112001',
    firstName: 'Marie',
    lastName: 'Rouault',
    photoUrl: '/photos/mrouault.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'lsaulnier',
    password: '31072000',
    firstName: 'Luc',
    lastName: 'Saulnier',
    photoUrl: '/photos/lsaulnier.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'vsegond',
    password: '12112000',
    firstName: 'Victor',
    lastName: 'Segond',
    photoUrl: '/photos/vsegond.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'jsegond',
    password: '21042002',
    firstName: 'Jean-Baptiste',
    lastName: 'Segond',
    photoUrl: '/photos/jsegond.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'atassel',
    password: '25012001',
    firstName: 'Augustin',
    lastName: 'Tassel',
    photoUrl: '/photos/atassel.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'iterlevic',
    password: '25092001',
    firstName: 'Ivana',
    lastName: 'Terlevic',
    photoUrl: '/photos/iterlevic.jpg',
    isAlive: true,
    isAdmin: false
  },
  {
    login: 'htiouin',
    password: '31032001',
    firstName: 'Hélène',
    lastName: 'Tiouin',
    photoUrl: '/photos/htiouin.jpg',
    isAlive: true,
    isAdmin: false
  }
];
