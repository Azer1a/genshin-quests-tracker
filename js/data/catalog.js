import * as world    from './questsWorld.js';
import * as archont  from './questsArchonts.js';
import * as legends  from './questsLegends.js';
import * as meetings from './questsMeetings.js';

// Локальная утилита 
function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }
  return result;
}

// Мировые квесты по регионам
const BY_REGION = {
  world: {
    mondstadt:          world.WORLD_QUESTS_MONDSTADT,
    liyue:              world.WORLD_QUESTS_LIYUE,
    dragonspine:        world.WORLD_QUESTS_DRAGONSPINE,
    inazuma:            world.WORLD_QUESTS_INAZUMA,
    enkanomiya:         world.WORLD_QUESTS_ENKANOMIYA,
    chasm:              world.WORLD_QUESTS_CHASM,
    sumeru:             world.WORLD_QUESTS_SUMERU,
    fontaine:           world.WORLD_QUESTS_FONTAINE,
    chenyu:             world.WORLD_QUESTS_CHENYU,
    sea_of_bygone_eras: world.WORLD_QUESTS_SEA_OF_BYGONE_ERAS,
    natlan:             world.WORLD_QUESTS_NATLAN,
    nodkrai:            world.WORLD_QUESTS_NODKRAI,
    windpeak:           world.WORLD_QUESTS_WINDPEAK,
    frostmoon:          world.WORLD_QUESTS_FROSTMOON,
    snezhnaya:          world.WORLD_QUESTS_SNEZHNAYA,
  },
};

// Режим категории
export function getCategoryMode(category) {
  if (category === 'archon')   return 'tom';
  if (category === 'world')    return 'region';
  if (category === 'story')    return 'flat';
  if (category === 'hangout')  return 'hero';
  return 'unknown';
}

// Доступ к данным
// Мировые
export function getQuestsByRegion(category, region) {
  return BY_REGION[category]?.[region] ?? [];
}

export function getRegionsForCategory(category) {
  return Object.keys(BY_REGION[category] ?? {});
}

//Легенд
export function getQuestsFlat(category) {
  if (category === 'story') return legends.LEGENDS_QUESTS;
  return [];
}

// Архонт
export function getArchonQuests() {
  return archont.ARCHONTS_QUESTS;
}

export function getTomsForArchon() {
  const toms = uniqueBy(archont.ARCHONTS_QUESTS, q => q.tom);
  const idx = toms.indexOf('Промежуточный том');
  if (idx !== -1 && idx !== toms.length - 1) {
    toms.splice(idx, 1);
    toms.push('Промежуточный том');
  }
  return toms;
}

export function getArchonQuestsByTom(tom) {
  return archont.ARCHONTS_QUESTS.filter(q => q.tom === tom);
}

// Встречи
export function getMeetingsQuests() {
  return meetings.MEETINGS_QUESTS;
}

export function getHeroesForMeetings() {
  return uniqueBy(meetings.MEETINGS_QUESTS, q => q.tom);
}

export function getMeetingsByHero(hero) {
  return meetings.MEETINGS_QUESTS.filter(q => q.tom === hero);
}