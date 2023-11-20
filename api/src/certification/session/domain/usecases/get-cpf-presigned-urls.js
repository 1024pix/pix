/** @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps */
import { config } from '../../../../../lib/config.js';

/**
 * @param {Object} params
 * @param {deps['cpfExportsStorage']} params.cpfExportsStorage
 */
const getPreSignedUrls = async function ({ date, cpfExportsStorage }) {
  const cpfExportFiles = await cpfExportsStorage.findAll();

  const keysOfFilesModifiedAfter = cpfExportFiles
    ?.filter(({ lastModifiedDate }) => lastModifiedDate >= date)
    .map(({ filename }) => filename);

  return cpfExportsStorage.preSignFiles({
    keys: keysOfFilesModifiedAfter,
    expiresIn: config.cpf.storage.cpfExports.commands.preSignedExpiresIn,
  });
};

export { getPreSignedUrls };
