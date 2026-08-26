/**
 * Sérialisation des instantanés de profil.
 *
 * Un instantané fige ce que l'utilisateur savait au moment où il a partagé sa
 * participation. Instantané et état de connaissance sont deux projections du
 * même objet : l'instantané fige le temps, l'état compresse l'espace. Ils se
 * représentent donc de la même façon — un état par tube.
 *
 * L'instantané embarque la compétence et la date de chaque tube : contrairement
 * à l'état vivant, il doit rester lisible même si le référentiel bouge après
 * coup.
 *
 * Les instantanés écrits du temps des knowledge elements restent lisibles :
 * ils se reconnaissent à leur forme de tableau — une entrée par acquis — et
 * se replient en état à la lecture. Ils se convertissent au prochain partage.
 */

import { keepOneVersionPerSkill, KnowledgeState, tubeIdOf } from '../models/KnowledgeState.js';

const SNAPSHOT_VERSION = 2;

const isLegacySnapshot = (snapshot) => Array.isArray(snapshot);

/** @param {KnowledgeState} knowledgeState */
export const serializeKnowledgeState = (knowledgeState) => {
  const competenceIdByTubeId = new Map(knowledgeState.skills.map((skill) => [tubeIdOf(skill), skill.competenceId]));

  const tubes = {};
  for (const { tubeId, floor, ceiling, directLevels, updatedAt } of knowledgeState.toRows()) {
    tubes[tubeId] = {
      floor,
      ceiling,
      directLevels,
      competenceId: competenceIdByTubeId.get(tubeId),
      createdAt: updatedAt ?? null,
    };
  }

  return { version: SNAPSHOT_VERSION, tubes };
};

/**
 * Relit un instantané en état de connaissance, hydraté du référentiel courant.
 *
 * @param {object|Array} snapshot tel que stocké
 * @param {Skill[]} allSkills le référentiel complet
 * @returns {KnowledgeState}
 */
export const deserializeSnapshot = ({ snapshot, allSkills }) => {
  const rows = isLegacySnapshot(snapshot) ? legacyRows(snapshot, allSkills) : versionedRows(snapshot);

  const tubeIds = new Set(rows.map(({ tubeId }) => tubeId));
  const skills = keepOneVersionPerSkill(allSkills.filter((skill) => tubeIds.has(tubeIdOf(skill))));

  return KnowledgeState.fromRows(rows, { skills });
};

const versionedRows = (snapshot) =>
  Object.entries(snapshot?.tubes ?? {}).map(([tubeId, { floor, ceiling, directLevels, createdAt }]) => ({
    tubeId,
    floor,
    ceiling,
    directLevels,
    updatedAt: createdAt,
  }));

/**
 * Replie un instantané historique — une entrée par acquis — en état par tube.
 * Un acquis disparu du référentiel est ignoré : il ne produisait déjà ni score
 * ni niveau. Deux parcours ont pu se contredire sur un même tube : la
 * validation gagne, comme lorsque la lecture retenait l'acquis le plus récent.
 */
const legacyRows = (snapshot, allSkills) => {
  const skillsById = new Map(allSkills.map((skill) => [skill.id, skill]));
  const tubes = new Map();

  for (const { skillId, status, source, createdAt } of snapshot) {
    const skill = skillsById.get(skillId);
    if (!skill) continue;

    const tubeId = tubeIdOf(skill);
    const tube = tubes.get(tubeId) ?? {
      floor: 0,
      ceiling: null,
      directLevels: [],
      updatedAt: null,
    };

    if (status === 'validated') {
      tube.floor = Math.max(tube.floor, skill.difficulty);
    } else if (status === 'invalidated') {
      tube.ceiling = tube.ceiling === null ? skill.difficulty : Math.min(tube.ceiling, skill.difficulty);
    }
    if (source === 'direct') {
      tube.directLevels = [...new Set([...tube.directLevels, skill.difficulty])];
    }

    const at = createdAt && new Date(createdAt);
    if (at && (!tube.updatedAt || at > tube.updatedAt)) {
      tube.updatedAt = at;
    }

    tubes.set(tubeId, tube);
  }

  for (const tube of tubes.values()) {
    if (tube.ceiling !== null && tube.ceiling <= tube.floor) {
      tube.ceiling = null;
    }
  }

  return [...tubes.entries()].map(([tubeId, tube]) => ({ tubeId, ...tube }));
};
