/** @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps */
import { config } from '../../../../../lib/config.js';

/**
 * @param {Object} params
 * @param {deps['cpfExportsStorage']} params.cpfExportsStorage
 */
const getPreSignedUrls = async function ({ cpfExportsStorage }) {
  const cpfExportFiles = await cpfExportsStorage.findAll();

  return cpfExportsStorage.preSignFiles({
    keys: cpfExportFiles.map(({ filename }) => filename),
    expiresIn: config.cpf.storage.cpfExports.commands.preSignedExpiresIn,
  });
};

export { getPreSignedUrls };
