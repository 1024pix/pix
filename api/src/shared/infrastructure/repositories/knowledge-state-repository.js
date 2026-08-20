/**
 * Persistance de l'état de connaissance, une ligne par couple utilisateur/tube.
 *
 * C'est la source de vérité, et la seule : les réponses finissent par être
 * purgées, l'état doit donc survivre sans elles.
 *
 * L'état se lit contre le référentiel : la lecture hydrate les acquis des
 * tubes touchés, une version par acquis, pour que le domaine puisse déplier
 * les bornes en acquis validés et invalidés.
 */

import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { keepOneVersionPerSkill, KnowledgeState, tubeIdOf } from '../../domain/models/KnowledgeState.js';
import * as skillRepository from './skill-repository.js';

const TABLE_NAME = 'knowledge-states';

const skillsOfTubes = (allSkills, tubeIds) => {
  const wanted = new Set(tubeIds);
  return keepOneVersionPerSkill(allSkills.filter((skill) => wanted.has(tubeIdOf(skill))));
};

const toKnowledgeState = ({ rows, allSkills, limitDate }) => {
  let state = KnowledgeState.fromRows(rows);
  if (limitDate) {
    state = state.restrictedToDate(limitDate);
  }
  return KnowledgeState.fromRows(state.toRows(), { skills: skillsOfTubes(allSkills, state.tubeIds) });
};

/**
 * L'état de l'utilisateur, hydraté du référentiel de ses tubes.
 *
 * `limitDate` demande l'état tel qu'il était à une date donnée : seuls les
 * tubes qui n'ont pas bougé depuis la décrivent encore, les autres sont
 * écartés. Le passé exact se fige par instantané, pas ici.
 */
export const findByUserId = async ({ userId, limitDate } = {}) => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn(TABLE_NAME).where({ userId });
  const allSkills = await skillRepository.list();

  return toKnowledgeState({ rows, allSkills, limitDate });
};

/** Les états de plusieurs utilisateurs, en une lecture. */
export const findByUserIds = async ({ userIds }) => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn(TABLE_NAME).whereIn('userId', userIds);
  const allSkills = await skillRepository.list();

  const rowsByUserId = Object.groupBy(rows, ({ userId }) => userId);
  return new Map(userIds.map((userId) => [userId, toKnowledgeState({ rows: rowsByUserId[userId] ?? [], allSkills })]));
};

/**
 * Enregistre l'état des tubes donnés — par défaut, tous ceux de l'état.
 *
 * Une réponse ne fait bouger qu'une ligne, là où le modèle historique écrivait
 * autant d'enregistrements que d'acquis inférés.
 */
export const save = async ({ userId, knowledgeState, tubeIds }) => {
  const knexConn = DomainTransaction.getConnection();
  const wanted = tubeIds && new Set(tubeIds);
  const rows = knowledgeState
    .toRows()
    .filter(({ tubeId }) => !wanted || wanted.has(tubeId))
    .map(({ tubeId, floor, ceiling, directLevels, updatedAt }) => ({
      userId,
      tubeId,
      floor,
      ceiling,
      directLevels,
      updatedAt: updatedAt ?? new Date(),
    }));

  if (rows.length === 0) {
    return;
  }

  await knexConn(TABLE_NAME)
    .insert(rows)
    .onConflict(['userId', 'tubeId'])
    .merge(['floor', 'ceiling', 'directLevels', 'updatedAt']);
};

/**
 * Efface l'état d'une compétence : remise à zéro. Il n'en reste aucune trace —
 * rien ne peut le reconstituer, et c'est le contrat.
 *
 * La compétence n'est pas portée par la table — le référentiel la donne déjà
 * pour chaque tube.
 */
export const forgetCompetence = async ({ userId, competenceId }) => {
  const allSkills = await skillRepository.list();
  const tubeIds = [...new Set(allSkills.filter((skill) => skill.competenceId === competenceId).map(tubeIdOf))];
  if (tubeIds.length === 0) {
    return;
  }

  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME).where({ userId }).whereIn('tubeId', tubeIds).delete();
};
