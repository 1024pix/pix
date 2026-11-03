/**
 * Keeps the knowledge elements produced by a user migrated to knowledge
 * states: they no longer go to `knowledge-elements`, but the data lake still
 * expects them. The rows wait here for their export.
 */
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import {
  KnowledgeElement,
  type KnowledgeElementSource,
  type KnowledgeElementStatus,
} from '../../domain/models/KnowledgeElement.js';

const TABLE_NAME = 'migrated_user_knowledge_elements';

export type MigratedUserKnowledgeElementRow = {
  id: number;
  source: KnowledgeElementSource;
  status: KnowledgeElementStatus;
  createdAt: Date;
  answerId: number | null;
  assessmentId: number | null;
  skillId: string;
  earnedPix: number;
  userId: number;
  competenceId: string;
  savedAt: Date | null;
};

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

/** The rows not exported yet whose id is in the range and created from an instant, included, to another, excluded, by ascending id. */
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

export const markSaved = async (ids: number[], at: Date): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();

  // One array parameter: a list of ids would hit the limit of 65,535 parameters of a statement.
  await knexConn<MigratedUserKnowledgeElementRow>(TABLE_NAME).whereRaw('"id" = ANY(?)', [ids]).update({ savedAt: at });
};
