import type { Knex } from 'knex';
import type { Client as PgClient } from 'pg';

import { type Replication, replications as defaultReplications } from '../../infrastructure/replications.ts';
import { copyFromStdin as defaultCopyFromStdin } from '../../infrastructure/utils/copy-from-stdin.ts';

/** knex exposes its connection pool through `knex.context.client`; knex's own typings do not cover it. */
type KnexWithPool = Knex & {
  readonly context: {
    readonly client: {
      acquireConnection(): Promise<PgClient>;
      releaseConnection(client: PgClient): Promise<void>;
    };
  };
};

/**
 * Refreshes a datamart table from its datawarehouse source (see `infrastructure/replications.ts`):
 * truncate the target, then stream the selected columns of the source into it with a single
 * `COPY ... FROM STDIN`.
 *
 * Rows are never part of a SQL statement or of its parameters, so the datamart statement logs
 * (which are shipped to Datadog) cannot contain them.
 */
export const extractTransformAndLoadData = async ({
  replicationName,
  datawarehouseKnex,
  datamartKnex,
  replications = defaultReplications,
  copyFromStdin = defaultCopyFromStdin,
}: {
  replicationName: string;
  datawarehouseKnex: Knex;
  datamartKnex: KnexWithPool;
  replications?: Readonly<Record<string, Replication>>;
  copyFromStdin?: typeof defaultCopyFromStdin;
}): Promise<{ count: number }> => {
  const replication = replications[replicationName];
  if (!replication) throw new Error(`Unknown replication "${replicationName}".`);
  const { source, target, columns } = replication;
  const targetColumns: readonly string[] = Array.isArray(columns) ? columns : Object.keys(columns);

  await datamartKnex(target).truncate();

  const pgClient = await datamartKnex.context.client.acquireConnection();
  const copy = copyFromStdin({ pgClient, table: target, columns: targetColumns });
  try {
    // knex streams rows as `any`; the CSV encoder only needs them keyed by column name.
    const rows: AsyncIterable<Record<string, unknown>> = datawarehouseKnex(source).select(columns).stream();
    for await (const row of rows) await copy.writeRow(row);

    const { rowCount } = await copy.end();
    return { count: rowCount };
  } catch (error) {
    // Leave the connection in a clean state before handing it back to the pool.
    await copy.abort(`replication "${replicationName}" failed`);
    throw error;
  } finally {
    await datamartKnex.context.client.releaseConnection(pgClient);
  }
};
