import { PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';

import ZipStream from 'zip-stream';

/**
 * Creates a ZIP archive progressively from an async iterable of documents.
 *
 * @param {AsyncIterable<{
 *   filename: string,
 *   content: import('node:stream').Readable
 * }>} documents
 * @param {AbortSignal} abortSignal
 * @returns {{
 *   stream: PassThrough,
 *   completion: Promise<void>
 * }}
 */
export function createZipStream(documents, abortSignal) {
  const archive = new ZipStream();
  const output = new PassThrough();

  const completion = pipeline(archive, output, {
    signal: abortSignal,
  });

  void populateArchive(archive, documents, abortSignal);

  return {
    stream: output,
    completion,
  };
}

/**
 * Progressively adds documents to the ZIP archive.
 *
 * Stops processing when the provided AbortSignal is aborted.
 *
 * @param {ZipStream} archive
 * @param {AsyncIterable<{
 *   filename: string,
 *   content: import('node:stream').Readable
 * }>} documents
 * @param {AbortSignal} signal
 * @returns {Promise<void>}
 */
async function populateArchive(archive, documents, signal) {
  const addEntry = promisify(archive.entry.bind(archive));
  try {
    for await (const document of documents) {
      if (signal.aborted || archive.destroyed) return;

      await addEntry(archive, document);
    }

    if (!signal.aborted) {
      archive.finish();
    }
  } catch (error) {
    archive.destroy(error);
  }
}
