/**
 * @typedef {import('./index.js').CpfExportsStorage} CpfExportsStorage
 */

/**
 * @param {object} params
 * @param {CpfExportsStorage} params.cpfExportsStorage
 */
export async function uploadCpfFiles({ filename, readableStream, logger, cpfExportsStorage }) {
  logger.trace('uploadCpfFiles: start upload');
  await cpfExportsStorage.sendFile({ filename, readableStream });
  logger.trace(`uploadCpfFiles: ${filename} upload done`);
}
