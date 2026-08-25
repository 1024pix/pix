/**
 * Persistance du score figé à l'action, une ligne par couple
 * utilisateur/compétence.
 *
 * C'est la seule valeur figée du modèle, et c'est assumé : elle encode une
 * exigence produit — le score ne bouge jamais sans action de l'utilisateur,
 * ni à la baisse ni à la hausse, quels que soient les mouvements du
 * référentiel. La position reste la vérité du savoir ; cette table n'est que
 * le solde : le score au dernier geste.
 *
 * Elle est entretenue par le même geste qui écrit la position
 * (voir knowledge-state-repository) : aucun chemin d'écriture ne peut l'oublier.
 */

import { DomainTransaction } from '../../domain/DomainTransaction.js';

const TABLE_NAME = 'competence-scores';

/** @returns {Promise<Map<string, number>>} pix bruts par compétence */
export const findByUserId = async ({ userId }) => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn(TABLE_NAME).where({ userId });
  return new Map(rows.map(({ competenceId, pix }) => [competenceId, pix]));
};

export const save = async ({ userId, competenceId, pix }) => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME)
    .insert({ userId, competenceId, pix })
    .onConflict(['userId', 'competenceId'])
    .merge(['pix']);
};

/** Efface le solde : le pendant de la remise à zéro de la position. */
export const forgetCompetence = async ({ userId, competenceId }) => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME).where({ userId, competenceId }).delete();
};
