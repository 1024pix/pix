/**
 * Keeps the knowledge elements produced by a user migrated to knowledge
 * states: they no longer go to `knowledge-elements`, but the data lake still
 * expects them. The rows wait here for their export.
 */
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeElement, type KnowledgeElementFields } from '../../domain/models/KnowledgeElement.js';

const TABLE_NAME = 'migrated_user_knowledge_elements';

export type MigratedUserKnowledgeElementRow = Required<KnowledgeElementFields> & { savedAt: Date | null };

/** Inserts the knowledge elements, all dated from the save, and gives them back with their id. */
export const batchSave = async (knowledgeElements: KnowledgeElement[], at: Date): Promise<KnowledgeElement[]> => {
  if (knowledgeElements.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();

  const knowledgeElementsDatedFromSave = knowledgeElements.map((knowledgeElement) => ({
    ...knowledgeElement,
    createdAt: at,
  }));

  const rows = await knexConn<MigratedUserKnowledgeElementRow>(TABLE_NAME)
    .insert(knowledgeElementsDatedFromSave)
    .returning('*');

  return rows.map((row) => new KnowledgeElement(row));
};

/** The rows not exported yet, by ascending id from the one after the given id, up to the limit. */
export const findUnsaved = async (afterId: number, limit: number): Promise<MigratedUserKnowledgeElementRow[]> => {
  const knexConn = DomainTransaction.getConnection();

  return knexConn<MigratedUserKnowledgeElementRow>(TABLE_NAME)
    .whereNull('savedAt')
    .where('id', '>', afterId)
    .orderBy('id')
    .limit(limit);
};

/**
 * The rows not exported yet with an id from firstId to lastId, both included,
 * and created at or after createdFrom and before createdBefore. Ordered by id.
 */
export const findUnsavedInRange = async (
  firstId: number,
  lastId: number,
  createdFrom: Date,
  createdBefore: Date,
): Promise<MigratedUserKnowledgeElementRow[]> => {
  const knexConn = DomainTransaction.getConnection();

  return knexConn<MigratedUserKnowledgeElementRow>(TABLE_NAME)
    .whereNull('savedAt')
    .whereBetween('id', [firstId, lastId])
    .where('createdAt', '>=', createdFrom)
    .where('createdAt', '<', createdBefore)
    .orderBy('id');
};

/** Sets the date of the save on the rows, the ones with the given ids, once exported. */
export const setSavedAt = async (ids: number[], at: Date): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();

  await knexConn<MigratedUserKnowledgeElementRow>(TABLE_NAME).whereIn('id', ids).update({ savedAt: at });
};
