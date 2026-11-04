/**
 * The record of each file of the export of the knowledge elements of migrated
 * users: created before the upload of the file, completed with the marking of
 * its rows.
 */
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const TABLE_NAME = 'migrated_user_knowledge_elements_export_files';

export type MigratedUserKnowledgeElementExportFile = {
  id: number;
  filename: string;
  firstId: number;
  lastId: number;
  rowCount: number;
  createdAt: Date;
  completedAt: Date | null;
};

type Row = {
  id: number;
  filename: string;
  first_id: number;
  last_id: number;
  row_count: number;
  created_at: Date;
  completed_at: Date | null;
};

const toExportFile = (row: Row): MigratedUserKnowledgeElementExportFile => ({
  id: row.id,
  filename: row.filename,
  firstId: row.first_id,
  lastId: row.last_id,
  rowCount: row.row_count,
  createdAt: row.created_at,
  completedAt: row.completed_at,
});

export const create = async (
  filename: string,
  firstId: number,
  lastId: number,
  rowCount: number,
): Promise<MigratedUserKnowledgeElementExportFile> => {
  const knexConn = DomainTransaction.getConnection();

  const [row] = await knexConn<Row>(TABLE_NAME)
    .insert({ filename, first_id: firstId, last_id: lastId, row_count: rowCount })
    .returning('*');
  if (!row) throw new Error(`The export file ${filename} could not be recorded`);

  return toExportFile(row);
};

/** The files recorded and not completed, by ascending first id. */
export const findPending = async (): Promise<MigratedUserKnowledgeElementExportFile[]> => {
  const knexConn = DomainTransaction.getConnection();

  const rows = await knexConn<Row>(TABLE_NAME).whereNull('completed_at').orderBy('first_id');

  return rows.map(toExportFile);
};

export const complete = async (id: number, rowCount: number, at: Date): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();

  await knexConn<Row>(TABLE_NAME).where({ id }).update({ row_count: rowCount, completed_at: at });
};
