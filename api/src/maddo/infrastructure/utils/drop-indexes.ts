import type { Client } from 'pg';

type IndexRow = { readonly name: string; readonly definition: string };

/**
 * Drops the indexes of a table and returns the `CREATE INDEX` statements that rebuild them.
 *
 * Loading a table without its indexes and building them afterwards is much faster than maintaining
 * them row by row. Indexes backing a constraint (primary key, unique, exclusion) are left in place:
 * they cannot be dropped without their constraint.
 *
 * Meant to be called inside a transaction, together with the load and the rebuild: PostgreSQL DDL is
 * transactional, so a failure (or a killed process) rolls everything back and the indexes are never lost.
 */
export const dropIndexes = async ({
  pgClient,
  table,
}: {
  pgClient: Client;
  table: string;
}): Promise<readonly string[]> => {
  // `regclass::text` yields an identifier that is already quoted (and schema-qualified when needed).
  const { rows } = await pgClient.query<IndexRow>(
    `SELECT i.indexrelid::regclass::text AS name, pg_get_indexdef(i.indexrelid) AS definition
     FROM pg_index i
     WHERE i.indrelid = $1::regclass
       AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = i.indexrelid)
     ORDER BY name`,
    [quoteIdentifier(table)],
  );

  for (const { name } of rows) await pgClient.query(`DROP INDEX ${name}`);

  return rows.map(({ definition }) => definition);
};

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;
