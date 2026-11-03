import { PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import ZipStream from 'zip-stream';

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
 * }}
 */
export function createZipStream(documents) {
  const archive = new ZipStream();
  const output = new PassThrough();

  const completion = pipeline(archive, output);

  void populateArchive(archive, documents);

  return {
    stream: output,
    completion,
  };
}

/**
 * Adds documents progressively to the ZIP archive.
 *
 * @param {ZipStream} archive
 * @param {AsyncIterable<{
 *   filename: string,
 *   content: import('node:stream').Readable
 * }>} documents
 * @returns {Promise<void>}
 */
async function populateArchive(archive, documents) {
  try {
    for await (const document of documents) {
      await addEntry(archive, document);
    }

    archive.finish();
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
