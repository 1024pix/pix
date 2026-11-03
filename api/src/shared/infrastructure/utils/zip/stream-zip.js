import { PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import ZipStream from 'zip-stream';

import { getCorrelationInfo } from '../../execution-context-manager.js';
import { logger } from '../logger.js';

/**
 * Creates a ZIP archive progressively from an async iterable of documents.
 *
 * @param {AsyncIterable<{
 *   filename: string,
 *   content: import('node:stream').Readable
 * }>} documents
 * @returns {{
 *   stream: PassThrough,
 *   completion: Promise<void>
 *   abortController: AbortController
 * }}
 */
export function createZipStream(documents) {
  const archive = new ZipStream();
  const output = new PassThrough();
  const abortController = new AbortController();

  const completion = pipeline(archive, output, {
    signal: abortController.signal,
  });

  const correlationInfo = getCorrelationInfo();
  completion.catch((error) => {
    logger.error(correlationInfo, error);
  });

  void populateArchive(archive, documents, abortController.signal);

  return {
    stream: output,
    completion,
    abortController,
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
  try {
    for await (const document of documents) {
      if (signal.aborted) return;

      await addEntry(archive, document);
    }

    if (!signal.aborted) {
      archive.finish();
    }
  } catch (error) {
    archive.destroy(error);
  }
}

/**
 * Adds a document to the ZIP archive.
 *
 * @param {ZipStream} archive
 * @param {{
 *   filename: string,
 *   content: import('node:stream').Readable
 * }} document
 * @returns {Promise<void>}
 */
function addEntry(archive, document) {
  return new Promise((resolve, reject) => {
    archive.entry(document.content, { name: document.filename }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
