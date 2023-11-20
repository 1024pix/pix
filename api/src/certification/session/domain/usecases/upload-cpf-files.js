/** @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps */

/**
 * @param {Object} params
 * @param {deps['cpfExportsStorage']} params.cpfExportsStorage
 */
const uploadCpfFiles = async function ({ filename, readableStream, logger, cpfExportsStorage }) {
  logger.trace('uploadCpfFiles: start upload');
  await cpfExportsStorage.sendFile({ filename, readableStream });
  logger.trace(`uploadCpfFiles: ${filename} upload done`);
};

export { uploadCpfFiles };
