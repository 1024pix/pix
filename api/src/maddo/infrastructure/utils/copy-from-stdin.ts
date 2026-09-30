import { once } from 'node:events';

import type { Client, Connection, Submittable } from 'pg';

/**
 * node-postgres `Connection` (the low-level protocol writer) plus its copy-in methods, which exist at
 * runtime but are not declared by `@types/pg`
 */
type PgConnection = Connection & {
  sendCopyFromChunk(chunk: Buffer): void;
  endCopyFrom(): void;
  sendCopyFail(message: string): void;
};

/**
 * A node-postgres "submittable": any object with a `submit` method is queued by `client.query()` as-is
 * and then receives the server messages for its statement
 * `@types/pg` only declares `submit`, the handlers for the four
 * messages a COPY FROM STDIN produces are added here.
 */
type CopyInQuery = Submittable & {
  readonly text: string;
  handleCopyInResponse(): void;
  handleCommandComplete(message: { text?: string }): void;
  handleReadyForQuery(): void;
  handleError(error: Error): void;
};

export type CopyFromStdin = {
  readonly text: string;
  /**
   * Pushes CSV bytes (e.g. a frame of `copyToStdout`) to the socket, honouring backpressure.
   * A chunk does not have to end on a row boundary.
   */
  write(chunk: Buffer): Promise<void>;
  /** Tells the server the data is complete and waits for it to commit the COPY. */
  end(): Promise<{ rowCount: number }>;
  /**
   * Cancels the COPY (nothing is inserted) and waits for the client to be ready again,
   * so it can safely be released to the pool. Never throws.
   */
  abort(reason?: string): Promise<void>;
};

/**
 * Bulk-loads CSV bytes into a PostgreSQL table with `COPY ... FROM STDIN`.
 *
 * The `query` object below is the node-postgres hook. The copy-in data itself
 * goes through `pgClient.connection`, via its public `sendCopyFromChunk` / `endCopyFrom` / `sendCopyFail`.
 */
export const copyFromStdin = ({
  pgClient,
  table,
  columns,
}: {
  pgClient: Client;
  table: string;
  columns: readonly string[];
}): CopyFromStdin => {
  if (!columns.length) throw new Error('COPY FROM STDIN requires at least one column.');

  // Settled by the pg handlers below, awaited by write()/end()/abort().
  const copyInStarted = Promise.withResolvers<void>();
  const rowCount = Promise.withResolvers<number>();
  const finished = Promise.withResolvers<void>();
  // Rejections are surfaced by those methods; avoid unhandled-rejection noise when nobody is awaiting yet.
  void copyInStarted.promise.catch(ignore);
  void rowCount.promise.catch(ignore);
  void finished.promise.catch(ignore);

  // Set by handleError so that write() fails fast and abort() knows the COPY is already over.
  let failure: Error | null = null;

  const query: CopyInQuery = {
    text: `COPY ${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(', ')}) FROM STDIN WITH (FORMAT csv)`,
    submit: (connection) => connection.query(query.text),
    handleCopyInResponse: () => copyInStarted.resolve(),
    // message.text looks like "COPY 1234"
    handleCommandComplete: (message) => rowCount.resolve(Number(/^COPY (\d+)$/.exec(message.text ?? '')?.[1])),
    handleReadyForQuery: () => finished.resolve(),
    handleError: (error) => {
      // node-postgres detaches this query from the client on error and handles the following
      // ReadyForQuery itself, so every pending promise must settle here.
      failure = error;
      copyInStarted.reject(error);
      rowCount.reject(error);
      finished.reject(error);
    },
  };

  pgClient.query(query);
  // The copy-in methods are not in @types/pg: see PgConnection.
  const connection = pgClient.connection as PgConnection;

  return {
    text: query.text,

    write: async (chunk) => {
      if (failure) throw failure;
      await copyInStarted.promise;
      connection.sendCopyFromChunk(chunk);
      if (connection.stream.writableNeedDrain) {
        await Promise.race([once(connection.stream, 'drain'), finished.promise]);
      }
    },

    end: async () => {
      await copyInStarted.promise;
      connection.endCopyFrom();
      await finished.promise;
      return { rowCount: await rowCount.promise };
    },

    abort: async (reason = 'aborted by client') => {
      // After a server error the COPY is already over: nothing to cancel.
      if (failure) return;
      try {
        await copyInStarted.promise;
        connection.sendCopyFail(reason);
        await finished.promise;
      } catch {
        // the server answers a CopyFail with an error: that is expected.
      }
    },
  };
};

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;

const ignore = (): undefined => undefined;
