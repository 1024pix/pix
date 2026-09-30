import { Readable } from 'node:stream';

import type { Client, Submittable } from 'pg';

/**
 * A node-postgres "submittable": any object with a `submit` method is queued by `client.query()` as-is
 * and then receives the server messages for its statement.
 * `@types/pg` only declares `submit`; the handlers for the messages a COPY TO STDOUT produces are added here.
 * (The client does not dispatch CopyOutResponse nor CopyDone: CommandComplete and ReadyForQuery follow anyway.)
 */
type CopyOutQuery = Submittable & {
  readonly text: string;
  handleCopyData(message: { chunk: Buffer }): void;
  handleCommandComplete(): void;
  handleReadyForQuery(): void;
  handleError(error: Error): void;
};

/**
 * Size of the CopyData frames pushed downstream. The server sends one CopyData per row; forwarding
 * them one by one costs one socket write per row on the other side, and throughput is flat from a few
 * KB to a few MB per write. This also bounds the memory held per stream.
 */
export const COPY_FRAME_BYTES = 512 * 1024;

/**
 * A byte Readable of CSV, in frames of at most COPY_FRAME_BYTES.
 * - `end` fires once the server has sent everything;
 * - `error` fires with the PostgreSQL error when the server rejects the COPY;
 * - destroying it (as `pipeline` does when the consumer fails) discards the rest of the data, and `close`
 *   fires once the connection is ready again, so it can safely be released to the pool. The protocol has
 *   no way to interrupt a COPY TO from the client side, so the server still sends the whole table.
 */
export type CopyToStdout = Readable & { readonly text: string };

/**
 * Bulk-reads a PostgreSQL table with `COPY ... TO STDOUT`, as CSV bytes.
 *
 * Together with `copyFromStdin`, this moves rows between two databases without decoding them:
 * `await pipeline(copyToStdout({ pgClient: source, ... }), copyFromStdin({ pgClient: target, ... }))`.
 * Dates, timestamps and JSON are then encoded by PostgreSQL on one side and parsed by PostgreSQL on the
 * other; both sessions are expected to use the default `DateStyle` (ISO).
 */
export const copyToStdout = ({
  pgClient,
  table,
  columns,
}: {
  pgClient: Client;
  table: string;
  columns: readonly string[];
}): CopyToStdout => {
  if (!columns.length) throw new Error('COPY TO STDOUT requires at least one column.');

  const connection = pgClient.connection;

  // Settled on ReadyForQuery (resolved) or on a server error (rejected).
  const finished = Promise.withResolvers<void>();
  void finished.promise.catch(ignore);

  // Set once the stream is destroyed: the remaining server data is drained and dropped.
  let discarding = false;
  // pg-protocol reuses its read buffer, so every chunk is copied into the frame under construction.
  let frame = Buffer.allocUnsafe(COPY_FRAME_BYTES);
  let frameLength = 0;

  const stream = new Readable({
    highWaterMark: COPY_FRAME_BYTES,
    // The consumer wants more: let the socket flow again (a no-op when it was not paused).
    read: () => connection.stream.resume(),
    // Called on destroy(), on error, and after end (autoDestroy): the connection is handed back only
    // once the server has finished its COPY.
    destroy: (error, callback) => {
      discarding = true;
      connection.stream.resume();
      settle(finished.promise.catch(ignore), () => callback(error));
    },
  });

  const push = (payload: Buffer) => {
    // Beyond the high-water mark: stop reading the socket until the consumer catches up.
    if (!stream.push(payload)) connection.stream.pause();
  };
  const flush = () => {
    if (frameLength === 0) return;
    push(frame.subarray(0, frameLength));
    frame = Buffer.allocUnsafe(COPY_FRAME_BYTES);
    frameLength = 0;
  };
  const collect = (chunk: Buffer) => {
    if (discarding) return;
    if (chunk.length > COPY_FRAME_BYTES - frameLength) flush();
    if (chunk.length >= COPY_FRAME_BYTES) return push(Buffer.from(chunk));
    chunk.copy(frame, frameLength);
    frameLength += chunk.length;
  };

  const query: CopyOutQuery = {
    text: `COPY ${quoteIdentifier(table)} (${columns.map(quoteIdentifier).join(', ')}) TO STDOUT WITH (FORMAT csv)`,
    submit: (connection) => connection.query(query.text),
    handleCopyData: (message) => collect(message.chunk),
    handleCommandComplete: () => {
      if (discarding) return;
      flush();
      stream.push(null);
    },
    handleReadyForQuery: () => finished.resolve(),
    handleError: (error) => {
      // node-postgres detaches this query from the client on error and handles the following
      // ReadyForQuery itself, so the connection is ready as soon as the error is reported.
      finished.reject(error);
      stream.destroy(error);
    },
  };

  pgClient.query(query);

  return Object.assign(stream, { text: query.text });
};

/** Bridges a promise to a Node stream callback. */
const settle = (promise: Promise<unknown>, callback: (error?: Error | null) => void): void => {
  promise.then(
    () => callback(),
    (error: Error) => callback(error),
  );
};

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;

const ignore = (): undefined => undefined;
