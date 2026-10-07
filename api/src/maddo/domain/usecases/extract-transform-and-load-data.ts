import type { Knex } from 'knex';
import type { Client as PgClient } from 'pg';

import { getInContext } from '../../../shared/infrastructure/execution-context-manager.js';
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
 * creates a temporary table to stream the selected columns of the source into it with a single
 * `COPY ... FROM STDIN`
 * then delete former table and rename temporary table in a single transaction *
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const tempTarget = `${replication.target}_staging_${getInContext('request_id', crypto.randomUUID())}`; // `getInContext` is a JS function thus typescript considers it as unsafe to call it
  try {
    const res = await fillTempTable(
      replication,
      tempTarget,
      replicationName,
      datamartKnex,
      datawarehouseKnex,
      copyFromStdin,
    );
    await datamartKnex.transaction(async (trx) => {
      await trx.raw('DROP TABLE ??', [replication.target]);
      await trx.raw('ALTER TABLE ?? RENAME TO ??', [tempTarget, replication.target]);
    });
    return res;
  } finally {
    await datamartKnex.raw('DROP TABLE IF EXISTS ??', [tempTarget]);
  }
};

async function fillTempTable(
  replication: Replication,
  tempTarget: string,
  replicationName: string,
  datamartKnex: KnexWithPool,
  datawarehouseKnex: Knex,
  copyFromStdin: typeof defaultCopyFromStdin,
) {
  const { target, source, columns } = replication;
  await datamartKnex.raw('CREATE TABLE ?? (LIKE ?? INCLUDING ALL)', [tempTarget, target]);
  const targetColumns: readonly string[] = Array.isArray(columns) ? columns : Object.keys(columns);
  const pgClient = await datamartKnex.context.client.acquireConnection();
  const copy = copyFromStdin({ pgClient, table: tempTarget, columns: targetColumns });
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
}
