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

type Row = Record<string, unknown>;

// Encoded CSV bytes buffered before being pushed to the socket. Throughput is flat from a few KB to a
// few MB per write; this bounds memory whatever the row width.
const FLUSH_BYTES = 512 * 1024;

export type CopyFromStdin = {
  readonly text: string;
  /**
   * Encodes a row (object keyed by column name) and buffers it; the buffer is pushed to the socket
   * every FLUSH_BYTES, honouring backpressure.
   */
  writeRow(row: Row): Promise<void>;
  /** Tells the server the data is complete and waits for it to commit the COPY. */
  end(): Promise<{ rowCount: number }>;
  /**
   * Cancels the COPY (nothing is inserted) and waits for the client to be ready again,
   * so it can safely be released to the pool. Never throws.
   */
  abort(reason?: string): Promise<void>;
};

/**
 * Bulk-loads rows into a PostgreSQL table with `COPY ... FROM STDIN`.
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

  // Settled by the pg handlers below, awaited by writeRow()/end()/abort().
  const copyInStarted = Promise.withResolvers<void>();
  const rowCount = Promise.withResolvers<number>();
  const finished = Promise.withResolvers<void>();
  // Rejections are surfaced by those methods; avoid unhandled-rejection noise when nobody is awaiting yet.
  void copyInStarted.promise.catch(ignore);
  void rowCount.promise.catch(ignore);
  void finished.promise.catch(ignore);

  // Set by handleError so that writeRow() fails fast and abort() knows the COPY is already over.
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

  // CSV waiting to be sent, and its size in UTF-8 bytes (what goes on the wire).
  let csv = '';
  let csvBytes = 0;

  const flush = async () => {
    if (csvBytes === 0) return;
    const payload = Buffer.from(csv, 'utf8');
    csv = '';
    csvBytes = 0;
    connection.sendCopyFromChunk(payload);
    if (connection.stream.writableNeedDrain) {
      await Promise.race([once(connection.stream, 'drain'), finished.promise]);
    }
  };

  return {
    text: query.text,

    writeRow: async (row) => {
      if (failure) throw failure;
      await copyInStarted.promise;
      const line = encodeCsvLine(columns.map((column) => row[column]));
      csv += line;
      csvBytes += Buffer.byteLength(line, 'utf8');
      if (csvBytes >= FLUSH_BYTES) await flush();
    },

    end: async () => {
      await copyInStarted.promise;
      await flush();
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

/**
 * Encodes one row as a CSV line understood by `COPY ... WITH (FORMAT csv)`.
 * - `null`/`undefined` become an unquoted empty field, which PostgreSQL reads as NULL;
 * - every other value is quoted, so delimiters, quotes and newlines inside values are safe;
 * - Dates are sent as ISO 8601, plain objects as JSON (for json/jsonb columns).
 */
export const encodeCsvLine = (values: unknown[]): string => values.map(encodeCsvField).join(',') + '\n';

const encodeCsvField = (value: unknown): string =>
  value === null || value === undefined ? '' : `"${toText(value).replaceAll('"', '""')}"`;

const toText = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
    case 'bigint':
    case 'boolean':
      return String(value);
    default:
      // plain objects and arrays, for json/jsonb columns
      return JSON.stringify(value);
  }
};

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;

const ignore = (): undefined => undefined;
