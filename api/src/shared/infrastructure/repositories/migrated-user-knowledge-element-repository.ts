/**
 * Keeps the knowledge elements produced by a user migrated to knowledge
 * states: they no longer go to `knowledge-elements`, but the data lake still
 * expects them. The rows wait here for their export.
 */
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeElement, type KnowledgeElementFields } from '../../domain/models/KnowledgeElement.js';

const TABLE_NAME = 'migrated_user_knowledge_elements';

type MigratedUserKnowledgeElementRow = Required<KnowledgeElementFields> & { savedAt: Date | null };

/** Inserts the knowledge elements, all dated from the save, and gives them back with their id. */
export const batchSave = async (knowledgeElements: KnowledgeElement[], at: Date): Promise<KnowledgeElement[]> => {
  if (knowledgeElements.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<MigratedUserKnowledgeElementRow>(TABLE_NAME)
    .insert(knowledgeElements.map(({ id: _id, createdAt: _createdAt, ...fields }) => ({ ...fields, createdAt: at })))
    .returning('*');

  return rows.map((row) => new KnowledgeElement(row));
};
