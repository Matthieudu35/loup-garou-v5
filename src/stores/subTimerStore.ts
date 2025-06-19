import { writable, derived, get } from 'svelte/store';
import { timer } from './timerStore';
import { enfantSauvageStates } from './enfantSauvageStore';
import { browser } from '$app/environment';

// Store pour indiquer si une mise à jour manuelle est en cours
export const isManualUpdate = writable(false);

// Interface pour un sous-timer
interface SubTimer {
  id: string;
  label: string;
  percent: number; // pourcentage du timer principal
  startTime: number; // en secondes depuis le début de la nuit
  endTime: number; // en secondes depuis le début de la nuit
  duration: number; // en secondes
  isActive: boolean;
  color: string; // pour l'affichage
  roles: string[]; // rôles concernés
  order?: number;
}

interface SubPhase {
  id: string;
  label: string;
  color: string;
  roles: string[];
  isActive?: (nightNumber: number) => boolean;
}

interface NightPhase {
  id: string;
  label: string;
  percent: number;
  color: string;
  isActive: (nightNumber?: number) => boolean;
  roles: string[];
  order: number;
  subPhases?: SubPhase[];
}

// Callback pour les changements de sous-timers
let onSubTimersChange: ((timers: SubTimer[]) => void) | null = null;

// Store de base pour la liste des sous-timers
const baseSubTimers = writable<SubTimer[]>([]);

// Store avec méthodes set et update
const subTimers = (() => {
    const { subscribe } = derived(baseSubTimers, ($timers) => {
        if (onSubTimersChange) {
            onSubTimersChange($timers);
        }
        return $timers;
    });

    return {
        subscribe,
        set: (timers: SubTimer[]) => {
            baseSubTimers.set(timers);
        },
        update: (updater: (timers: SubTimer[]) => SubTimer[]) => {
            baseSubTimers.update(updater);
        }
    };
})();

// Fonction pour configurer le callback de changement de sous-timers
export function setSubTimersCallback(callback: (timers: SubTimer[]) => void) {
    onSubTimersChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseSubTimers.subscribe(timers => {
        callback(timers);
    })();
}

// Store pour le sous-timer actif
const activeSubTimer = derived(subTimers, ($subTimers) => {
  return $subTimers.find(timer => timer.isActive);
});

// Fonction pour calculer les timings des sous-timers
function calculateSubTimerTimings(timers: SubTimer[], totalDuration: number): SubTimer[] {
  // Grouper les timers par ordre
  const timersByOrder = timers.reduce((acc, timer) => {
    const order = timer.order || 0;
    if (!acc[order]) acc[order] = [];
    acc[order].push(timer);
    return acc;
  }, {} as Record<number, SubTimer[]>);

  // Calculer les timings pour chaque groupe d'ordre
  let currentTime = 0;
  const result: SubTimer[] = [];

  Object.keys(timersByOrder)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(order => {
      const timersInOrder = timersByOrder[order];
      
      // Cas spécial pour les timers d'ordre 1 (voyante et lgn)
      if (order === 1) {
        timersInOrder.forEach(timer => {
          if (timer.id === 'lgn') {
            // Pour les loups normaux, on prend 50% du temps total
            const duration = Math.floor(totalDuration * 0.5);
            result.push({
              ...timer,
              startTime: 0,
              endTime: duration,
              duration,
              percent: 50 // Forcer le pourcentage à 50% pour que la barre commence pleine
            });
          } else {
            // Pour la voyante, on prend 100% du temps total
            result.push({
              ...timer,
              startTime: 0,
              endTime: totalDuration,
              duration: totalDuration,
              percent: 100 // Forcer le pourcentage à 100%
            });
          }
        });
        currentTime = Math.floor(totalDuration * 0.5); // On avance le temps pour les timers suivants
      } else {
        // Pour les autres ordres, on calcule normalement
        const duration = Math.floor((totalDuration * timersInOrder[0].percent) / 100);
        const startTime = currentTime;
        const endTime = startTime + duration;

        timersInOrder.forEach(timer => {
          result.push({
            ...timer,
            startTime,
            endTime,
            duration
          });
        });

        currentTime = endTime;
      }
    });

  return result;
}

// Fonction pour mettre à jour les timings quand le timer principal change
function updateSubTimerTimings() {
  // Ne pas mettre à jour si c'est une mise à jour manuelle
  if (get(isManualUpdate)) return;

  const currentTimer = get(timer);
  
  baseSubTimers.update(timers => {
    // Sauvegarder l'état actif des timers
    const activeTimers = timers.filter(t => t.isActive).map(t => t.id);
    
    // Calculer les nouveaux timings
    const newTimers = calculateSubTimerTimings(timers, currentTimer.initialTimer);
    
    // Restaurer l'état actif des timers
    return newTimers.map(timer => ({
      ...timer,
      isActive: activeTimers.includes(timer.id)
    }));
  });
}

// Fonction pour ajouter un sous-timer
function addSubTimer(newTimer: SubTimer) {
  baseSubTimers.update(timers => {
    const newTimers = [...timers, newTimer];
    return calculateSubTimerTimings(newTimers, get(timer).initialTimer);
  });
}

// Fonction pour démarrer un sous-timer
function startSubTimer(id: string) {
  console.log('subTimerStore - startSubTimer:', { id });
  baseSubTimers.update(timers => {
    return timers.map(timer => ({
      ...timer,
      isActive: timer.id === id
    }));
  });
}

// Fonction pour arrêter un sous-timer
function stopSubTimer(id: string) {
  console.log('subTimerStore - stopSubTimer:', { id });
  baseSubTimers.update(timers => {
    return timers.map(timer => {
      if (timer.id === id) {
        return { ...timer, isActive: false };
      }
      return timer;
    });
  });
}

// Fonction pour passer au sous-timer suivant
function nextSubTimer() {
  console.log('subTimerStore - nextSubTimer called');
  baseSubTimers.update(timers => {
    const activeIndex = timers.findIndex(t => t.isActive);
    console.log('subTimerStore - nextSubTimer current state:', {
      activeIndex,
      timers: timers.map(t => ({ id: t.id, isActive: t.isActive }))
    });
    
    if (activeIndex === -1) {
      // Si aucun timer n'est actif, on active le premier
      return timers.map((t, i) => ({ ...t, isActive: i === 0 }));
    } else if (activeIndex < timers.length - 1) {
      // On active le timer suivant
      return timers.map((t, i) => ({ ...t, isActive: i === activeIndex + 1 }));
    } else {
      // Si c'était le dernier timer, on désactive tout
      return timers.map(t => ({ ...t, isActive: false }));
    }
  });
}

// Fonction pour calculer les sous-timers à partir de la durée totale de la nuit
function calculateSubTimers(totalDuration: number, nightNumber: number): SubTimer[] {
  console.log('calculateSubTimers called:', {
    totalDuration,
    nightNumber
  });

  // Définir les phases de la nuit avec leurs pourcentages et rôles
  const nightPhases = [
    {
      id: 'voyante',
      label: 'Voyante',
      percent: 100,
      color: 'violet',
      isActive: () => true,
      roles: ['voyante', 'Voyante'],
      order: 1,
    },
    {
      id: 'lgn',
      label: 'Loups-Garous',
      percent: 50,
      color: 'red',
      isActive: () => true,
      roles: [
        'loupGarou', 'loup garou', 'loup-garou', 'Loup-garou', 'Loup Garou', 'loup', 'Loup',
        'loupSolitaire', 'loup solitaire', 'loup-solitaire', 'Loup Solitaire', 'Loup-solitaire',
        'chienLoup', 'chien loup', 'chien-loup', 'Chien-loup', 'Chien Loup'
      ],
      order: 1,
    },
    {
      id: 'infectPereDesLoups',
      label: 'Infect Père des Loups',
      percent: 25, // 25% du temps total
      color: 'orange',
      isActive: () => true,
      roles: [
        'infectPereDesLoups', 'infect pere des loups', 'infect-pere-des-loups', 
        'Infect Père des Loups', 'Infect-pere-des-loups', 'Infect père des loups'
      ],
      order: 2, // Commence après les loups normaux
    },
    {
      id: 'grandMechantLoup',
      label: 'Grand Méchant Loup',
      percent: 25, // 25% du temps total
      color: 'brown',
      isActive: () => true,
      roles: [
        'grandMechantLoup', 'grand mechant loup', 'grand-mechant-loup', 
        'Grand Méchant Loup', 'Grand-mechant-loup', 'Grand méchant loup'
      ],
      order: 2, // Même ordre que infectPereDesLoups
    },
    {
      id: 'loupBlanc',
      label: 'Loup Blanc',
      percent: 25, // 25% du temps total
      color: 'white',
      isActive: (nightNumber: number) => nightNumber % 2 === 1, // Seulement les nuits impaires
      roles: [
        'loupBlanc', 'loup blanc', 'loup-blanc', 'Loup Blanc', 'Loup-blanc'
      ],
      order: 2, // Même ordre que infectPereDesLoups
    },
    {
      id: 'sorciere',
      label: 'Sorcière',
      percent: 25, // 25% du temps total (phase 3-4)
      color: 'purple',
      isActive: () => true,
      roles: ['sorciere', 'Sorcière', 'sorcière', 'Sorciere'],
      order: 4,
    }
  ];

  // Filtrer les phases actives pour cette nuit
  const activePhases = nightPhases.filter(phase => phase.isActive(nightNumber));
  
  console.log('Active phases:', activePhases.map(phase => ({
    id: phase.id,
    roles: phase.roles
  })));

  // Réinitialiser les sous-timers
  baseSubTimers.set([]);

  // Ajouter chaque phase active
  activePhases.forEach(phase => {
    addSubTimer({
      id: phase.id,
      label: phase.label,
      percent: phase.percent,
      startTime: 0,
      endTime: 0,
      duration: 0,
      isActive: false,
      color: phase.color,
      roles: phase.roles,
      order: phase.order,
    });
  });

  // Calculer les timings initiaux
  updateSubTimerTimings();

  // Activer uniquement le premier sous-timer
  const result = get(baseSubTimers).map((t, i) => ({ ...t, isActive: i === 0 }));
  baseSubTimers.set(result);
  
  return result;
}

// Fonction pour passer aux rôles suivants
function skipToNextRoles(currentRoleId: string): SubTimer[] {
  // Activer le flag de mise à jour manuelle
  isManualUpdate.set(true);
  
  const currentTimer = get(timer);
  const elapsed = currentTimer.initialTimer - currentTimer.timer;
  const timeLeft = currentTimer.timer;

  const updatedTimers = get(baseSubTimers).map(timer => {
    if (timer.id === currentRoleId) {
      // Pour le timer actif, on le met à 0
      return { 
        ...timer, 
        endTime: elapsed,
        duration: 0,
        isActive: false,
        percent: 0
      };
    } else if (['grandMechantLoup', 'loupBlanc', 'infectPereDesLoups'].includes(timer.id)) {
      // Pour les timers de la phase 2, on leur donne leur part initiale + le temps restant des loups
      const initialPhase2Time = Math.round(currentTimer.initialTimer * 0.25); // 25% du temps total
      const lgnRemainingTime = Math.round(timer.endTime - elapsed); // Temps restant des loups
      const newDuration = Math.round(initialPhase2Time + lgnRemainingTime);
      return {
        ...timer,
        startTime: elapsed,
        endTime: elapsed + newDuration,
        duration: newDuration,
        isActive: true,
        percent: Math.round((newDuration / currentTimer.initialTimer) * 100)
      };
    }
    return timer;
  });

  // Réinitialiser le flag après un délai plus long (1.5s)
  setTimeout(() => {
    isManualUpdate.set(false);
  }, 1500);

  baseSubTimers.set(updatedTimers);
  return updatedTimers;
}

// Fonction pour ajuster les sous-timers après un changement de durée
function adjustSubTimersAfterTimerChange(newInitial: number) {
  const currentTimer = get(timer);
  const elapsed = currentTimer.initialTimer - currentTimer.timer;

  // Activer le flag de mise à jour manuelle
  isManualUpdate.set(true);

  baseSubTimers.update(timers => {
    // Sauvegarder l'état actif des timers
    const activeTimers = timers.filter(t => t.isActive).map(t => t.id);

    // Séparer les timers déjà commencés et ceux à venir
    const startedTimers = timers.filter(t => t.startTime < elapsed);
    const upcomingTimers = timers.filter(t => t.startTime >= elapsed);

    // Ajuster les timers déjà commencés
    const adjustedStartedTimers = startedTimers.map(timer => ({
      ...timer,
      endTime: elapsed,
      duration: Math.max(0, elapsed - timer.startTime), // Protection contre les durées négatives
      isActive: activeTimers.includes(timer.id)
    }));

    // Calculer le temps restant pour les timers à venir
    const remainingTime = newInitial - elapsed;

    // Calculer la somme des pourcentages des timers à venir
    const totalPercent = upcomingTimers.reduce((sum, t) => sum + t.percent, 0);

    // Ajuster les timers à venir avec correction de la durée totale
    let totalAssigned = 0;
    const adjustedUpcomingTimers = upcomingTimers.map((timer, i) => {
      const baseDuration = Math.floor((timer.percent / totalPercent) * remainingTime);
      totalAssigned += baseDuration;
      return {
        ...timer,
        startTime: elapsed,
        endTime: elapsed + baseDuration,
        duration: baseDuration,
        isActive: activeTimers.includes(timer.id)
      };
    });

    // Correction éventuelle du dernier timer pour assurer la durée totale exacte
    if (adjustedUpcomingTimers.length > 0) {
      const last = adjustedUpcomingTimers.length - 1;
      const missing = remainingTime - totalAssigned;
      adjustedUpcomingTimers[last].duration += missing;
      adjustedUpcomingTimers[last].endTime += missing;
    }

    return [...adjustedStartedTimers, ...adjustedUpcomingTimers];
  });

  // Réinitialiser le flag après un court délai
  setTimeout(() => {
    isManualUpdate.set(false);
  }, 100);
}

// S'abonner aux changements du timer principal
timer.subscribe(() => {
  updateSubTimerTimings();
});

// Fonction pour vérifier si un utilisateur a un rôle qui correspond à l'une des phases
export function userHasActiveRole(userRole: string, userLogin?: string): string | null {
  if (!userRole) return null;
  
  const normalizedRole = userRole.toLowerCase().trim();
  const currentSubTimers = get(baseSubTimers);
  
  // Vérifier si c'est un Enfant Sauvage qui est devenu un loup
  const isEnfantSauvageWolf = userLogin && userRole === 'Enfant sauvage' && 
    get(enfantSauvageStates)[userLogin]?.hasSwitched;
  
  for (const subTimer of currentSubTimers) {
    // Vérifier si l'un des rôles du sous-timer correspond au rôle de l'utilisateur
    // en normalisant les deux pour la comparaison
    const matchingRole = subTimer.roles.find(role => {
      const normalizedTimerRole = role.toLowerCase().trim();
      const matches = normalizedTimerRole === normalizedRole ||
        normalizedRole.includes(normalizedTimerRole) ||
        normalizedTimerRole.includes(normalizedRole);
      
      // Si c'est un Enfant Sauvage devenu loup et que c'est la phase des loups
      if (isEnfantSauvageWolf && subTimer.id === 'lgn') {
        return true;
      }
      
      return matches;
    });
    
    if (matchingRole) {
      return subTimer.id;
    }
  }
  
  return null;
}

export {
  subTimers,
  activeSubTimer,
  calculateSubTimers,
  nextSubTimer,
  startSubTimer,
  stopSubTimer,
  skipToNextRoles,
  adjustSubTimersAfterTimerChange
}; 