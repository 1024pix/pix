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

/** A stored knowledge element of a migrated user, as the export reads it. */
export type MigratedUserKnowledgeElement = {
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

type Row = {
  id: number;
  source: KnowledgeElementSource;
  status: KnowledgeElementStatus;
  created_at: Date;
  answer_id: number | null;
  assessment_id: number | null;
  skill_id: string;
  earned_pix: number;
  user_id: number;
  competence_id: string;
  saved_at: Date | null;
};

const toRow = (knowledgeElement: KnowledgeElement, createdAt: Date): Omit<Row, 'id' | 'saved_at'> => ({
  source: knowledgeElement.source,
  status: knowledgeElement.status,
  created_at: createdAt,
  answer_id: knowledgeElement.answerId ?? null,
  assessment_id: knowledgeElement.assessmentId ?? null,
  skill_id: knowledgeElement.skillId,
  earned_pix: knowledgeElement.earnedPix,
  user_id: knowledgeElement.userId,
  competence_id: knowledgeElement.competenceId,
});

const toMigratedUserKnowledgeElement = (row: Row): MigratedUserKnowledgeElement => ({
  id: row.id,
  source: row.source,
  status: row.status,
  createdAt: row.created_at,
  answerId: row.answer_id,
  assessmentId: row.assessment_id,
  skillId: row.skill_id,
  earnedPix: row.earned_pix,
  userId: row.user_id,
  competenceId: row.competence_id,
  savedAt: row.saved_at,
});

/** Inserts the knowledge elements, all dated from the save, and gives them back with their id. */
export const batchSave = async (knowledgeElements: KnowledgeElement[], at: Date): Promise<KnowledgeElement[]> => {
  if (knowledgeElements.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();

  const rows = await knexConn<Row>(TABLE_NAME)
    .insert(knowledgeElements.map((knowledgeElement) => toRow(knowledgeElement, at)))
    .returning('*');

  return rows.map((row) => new KnowledgeElement(toMigratedUserKnowledgeElement(row)));
};

/** The rows not exported yet, by ascending id from the one after the given id, up to the limit. */
export const findUnsaved = async (afterId: number, limit: number): Promise<MigratedUserKnowledgeElement[]> => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<Row>(TABLE_NAME)
    .whereNull('saved_at')
    .where('id', '>', afterId)
    .orderBy('id')
    .limit(limit);

  return rows.map(toMigratedUserKnowledgeElement);
};

/** The rows not exported yet whose id is in the range and created from an instant, included, to another, excluded, by ascending id. */
export const findUnsavedInRange = async (
  firstId: number,
  lastId: number,
  createdFrom: Date,
  createdBefore: Date,
): Promise<MigratedUserKnowledgeElement[]> => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<Row>(TABLE_NAME)
    .whereNull('saved_at')
    .whereBetween('id', [firstId, lastId])
    .where('created_at', '>=', createdFrom)
    .where('created_at', '<', createdBefore)
    .orderBy('id');

  return rows.map(toMigratedUserKnowledgeElement);
};

/** Sets the date of the save on the rows, the ones with the given ids, once exported. */
export const setSavedAt = async (ids: number[], at: Date): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();

  // One array parameter: a list of ids would hit the limit of 65,535 parameters of a statement.
  await knexConn<Row>(TABLE_NAME).whereRaw('"id" = ANY(?)', [ids]).update({ saved_at: at });
};
