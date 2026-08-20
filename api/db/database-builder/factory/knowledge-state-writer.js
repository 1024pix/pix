import { databaseBuffer } from '../database-buffer.js';

// Niveau que `learningContent.buildSkill` donne à un acquis dont le test ne dit rien.
const DEFAULT_SKILL_LEVEL = 2;

/**
 * Écriture de l'état de connaissance par les fabriques de test.
 *
 * C'est la transposition de ce que fait la production à chaque réponse : une
 * seule ligne bouge par tube, le plancher monte sur un acquis réussi, le
 * plafond descend sur un acquis raté.
 */

/**
 * Situe l'acquis dans le référentiel que le test a décrit.
 *
 * Un acquis sans tube est seul dans le sien — même règle que `tubeIdOf` côté
 * domaine, de sorte que l'état écrit ici se relise à l'identique. Le référentiel
 * doit être construit AVANT : un acquis encore inconnu prend un tube à lui seul,
 * et l'état écrit ne rejoindra jamais celui que le vrai tube décrit.
 */
export const locateSkill = ({ skillId }) => {
  const skills = databaseBuffer.builtObjects['learningcontent.skills'] ?? [];
  const skill = skills.find(({ id }) => id === skillId);

  return { tubeId: skill?.tubeId ?? skillId, level: skill?.level ?? DEFAULT_SKILL_LEVEL };
};

/**
 * Retrouve l'état déjà décrit pour ce tube, y compris s'il a été inséré par un
 * commit précédent : un second passage le met à jour, il ne le double pas.
 */
const findState = ({ userId, tubeId }) => {
  const known = (databaseBuffer.builtObjects['knowledge-states'] ?? []).find(
    (state) => state.userId === userId && state.tubeId === tubeId,
  );
  if (!known) {
    return null;
  }

  // Déjà inséré : il faut le remettre dans la file pour que la mise à jour parte.
  const queued = databaseBuffer.objectsToInsert['knowledge-states'] ?? [];
  if (!queued.includes(known)) {
    databaseBuffer.pushInsertable({ tableName: 'knowledge-states', values: known });
    databaseBuffer.builtObjects['knowledge-states'].pop();
  }

  return known;
};

/**
 * Porte au crédit de l'utilisateur ce qu'un acquis réussi ou raté lui apprend.
 *
 * L'état ne fait que se resserrer : le plancher monte, le plafond descend. Un
 * acquis déjà couvert par l'état ne le change pas, comme dans le domaine.
 */
export const recordSkillOutcome = ({ userId, skillId, isOk, createdAt }) => {
  const { tubeId, level } = locateSkill({ skillId });
  const existing = findState({ userId, tubeId });

  if (!existing) {
    return databaseBuffer.pushInsertable({
      tableName: 'knowledge-states',
      values: {
        id: databaseBuffer.getNextId(),
        userId,
        tubeId,
        floor: isOk ? level : 0,
        ceiling: isOk ? null : level,
        directLevels: [level],
        updatedAt: createdAt,
      },
    });
  }

  if (isOk) {
    existing.floor = Math.max(existing.floor, level);
  } else {
    existing.ceiling = existing.ceiling === null ? level : Math.min(existing.ceiling, level);
  }
  if (!existing.directLevels.includes(level)) {
    existing.directLevels = [...existing.directLevels, level];
  }
  if (new Date(createdAt) > new Date(existing.updatedAt)) {
    existing.updatedAt = createdAt;
  }
  // Deux parcours ont pu se contredire : la validation l'emporte.
  if (existing.ceiling !== null && existing.ceiling <= existing.floor) {
    existing.ceiling = null;
  }

  return existing;
};

/** Efface l'état des tubes d'une compétence : remise à zéro. */
export const forgetCompetence = ({ userId, competenceId }) => {
  const skills = databaseBuffer.builtObjects['learningcontent.skills'] ?? [];
  const tubeIds = new Set(
    skills.filter((skill) => skill.competenceId === competenceId).map((skill) => skill.tubeId ?? skill.id),
  );
  // L'oubli porte sur les deux registres : la file d'insertion, et la mémoire
  // de ce qui a été construit — sans quoi la réponse suivante y retrouverait
  // l'état effacé et le prolongerait.
  const keep = (state) => !(state.userId === userId && tubeIds.has(state.tubeId));

  for (const registry of [databaseBuffer.objectsToInsert, databaseBuffer.builtObjects]) {
    registry['knowledge-states'] = (registry['knowledge-states'] ?? []).filter(keep);
  }
};
