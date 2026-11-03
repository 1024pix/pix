import { PassThrough } from 'node:stream';

import ZipStream from 'zip-stream';

/**
 * Creates a ZIP archive progressively from an iterable of documents.
 *
 * @param {AsyncIterable<{
 *   filename: string,
 *   content: import('node:stream').Readable
 * }>} documents
 * @returns {import('node:stream').PassThrough}
 */
export function createZipStream(documents) {
  const archive = new ZipStream();

  const output = new PassThrough();

  archive.pipe(output);

  (async () => {
    try {
      for await (const document of documents) {
        await addEntry(archive, document);
      }

      archive.finish();
    } catch (error) {
      archive.destroy(error);
      output.destroy(error);
    }
  })();

  return output;
}

function addEntry(archive, document) {
  return new Promise((resolve, reject) => {
    archive.entry(document.content, { name: document.filename }, (error) => (error ? reject(error) : resolve()));
  });
}
