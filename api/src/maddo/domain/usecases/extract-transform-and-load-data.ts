import type { Knex } from 'knex';
import type { Client as PgClient } from 'pg';

import { type Replication, replications as defaultReplications } from '../../infrastructure/replications.ts';
import {
  type CopyFromStdin,
  copyFromStdin as defaultCopyFromStdin,
} from '../../infrastructure/utils/copy-from-stdin.ts';
import { type CopyToStdout, copyToStdout as defaultCopyToStdout } from '../../infrastructure/utils/copy-to-stdout.ts';
import { dropIndexes as defaultDropIndexes } from '../../infrastructure/utils/drop-indexes.ts';

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
 * Refreshes a datamart table from its datawarehouse source (see `infrastructure/replications.ts`), in a
 * single transaction on the datamart: drop the target indexes, truncate the target, pipe a
 * `COPY ... TO STDOUT` of the selected source columns into a single `COPY ... FROM STDIN`, then rebuild
 * the indexes.
 *
 * The CSV bytes produced by the datawarehouse are forwarded as they are to the datamart: rows are never
 * decoded in this process, which keeps its CPU usage negligible.
 *
 * Loading without the indexes and building them afterwards is much faster than maintaining them row by
 * row. The transaction makes the refresh atomic: on failure the target keeps its previous rows and
 * indexes. Until the commit, readers of the target wait instead of seeing an empty or partial table.
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
  copyToStdout = defaultCopyToStdout,
  dropIndexes = defaultDropIndexes,
}: {
  replicationName: string;
  datawarehouseKnex: KnexWithPool;
  datamartKnex: KnexWithPool;
  replications?: Readonly<Record<string, Replication>>;
  copyFromStdin?: typeof defaultCopyFromStdin;
  copyToStdout?: typeof defaultCopyToStdout;
  dropIndexes?: typeof defaultDropIndexes;
}): Promise<{ count: number }> => {
  const replication = replications[replicationName];
  if (!replication) throw new Error(`Unknown replication "${replicationName}".`);
  const { source, target } = replication;
  const { sourceColumns, targetColumns } = splitColumns(replication.columns);

  const { sourcePgClient, targetPgClient, release } = await acquireConnections({ datawarehouseKnex, datamartKnex });
  try {
    await targetPgClient.query('BEGIN');
    const indexDefinitions = await dropIndexes({ pgClient: targetPgClient, table: target });
    await targetPgClient.query(`TRUNCATE ${quoteIdentifier(target)} RESTART IDENTITY`);
    const count = await pipeCopy({
      copyOut: copyToStdout({ pgClient: sourcePgClient, table: source, columns: sourceColumns }),
      copyIn: copyFromStdin({ pgClient: targetPgClient, table: target, columns: targetColumns }),
      abortReason: `replication "${replicationName}" failed`,
    });
    for (const indexDefinition of indexDefinitions) await targetPgClient.query(indexDefinition);
    await targetPgClient.query('COMMIT');
    return { count };
  } catch (error) {
    // The original error is the one worth reporting, even if the rollback fails too.
    await targetPgClient.query('ROLLBACK').catch(ignore);
    throw error;
  } finally {
    await release();
  }
};

/** `columns` is either a list of names shared by both sides, or a `{ target: source }` mapping. */
const splitColumns = (
  columns: Replication['columns'],
): { sourceColumns: readonly string[]; targetColumns: readonly string[] } =>
  isColumnList(columns)
    ? { sourceColumns: columns, targetColumns: columns }
    : { sourceColumns: Object.values(columns), targetColumns: Object.keys(columns) };

const isColumnList = (columns: Replication['columns']): columns is readonly string[] => Array.isArray(columns);

/** Takes one connection from each pool; `release` hands both back. */
const acquireConnections = async ({
  datawarehouseKnex,
  datamartKnex,
}: {
  datawarehouseKnex: KnexWithPool;
  datamartKnex: KnexWithPool;
}): Promise<{ sourcePgClient: PgClient; targetPgClient: PgClient; release: () => Promise<void> }> => {
  const targetPgClient = await datamartKnex.context.client.acquireConnection();
  const releaseTarget = () => datamartKnex.context.client.releaseConnection(targetPgClient);
  const sourcePgClient = await datawarehouseKnex.context.client.acquireConnection().catch(async (error: unknown) => {
    await releaseTarget();
    throw error;
  });
  const release = async () => {
    await datawarehouseKnex.context.client.releaseConnection(sourcePgClient);
    await releaseTarget();
  };
  return { sourcePgClient, targetPgClient, release };
};

/**
 * Forwards the frames of a `COPY ... TO STDOUT` to a `COPY ... FROM STDIN` and returns the number of rows
 * loaded. Both connections are ready for another statement when it settles, whether it succeeds or fails.
 */
const pipeCopy = async ({
  copyOut,
  copyIn,
  abortReason,
}: {
  copyOut: CopyToStdout;
  copyIn: CopyFromStdin;
  abortReason: string;
}): Promise<number> => {
  try {
    // A Readable iterates as `any`; copyToStdout pushes CSV bytes.
    const frames: AsyncIterable<Buffer> = copyOut;
    for await (const frame of frames) await copyIn.write(frame);

    const { rowCount } = await copyIn.end();
    return rowCount;
  } catch (error) {
    await copyIn.abort(abortReason);
    throw error;
  } finally {
    // The source connection is ready again only once the stream is closed.
    copyOut.destroy();
    await closed(copyOut);
  }
};

const closed = (stream: CopyToStdout): Promise<void> =>
  stream.closed ? Promise.resolve() : new Promise((resolve) => stream.once('close', () => resolve()));

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;

const ignore = (): undefined => undefined;
