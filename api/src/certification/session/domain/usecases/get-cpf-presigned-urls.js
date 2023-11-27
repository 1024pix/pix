/** @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps */
import { CpfImportStatus } from '../models/CpfImportStatus.js';

/**
 * @param {Object} params
 * @param {deps['cpfExportsStorage']} params.cpfExportsStorage
 * @param {deps['cpfExportRepository']} params.cpfExportRepository
 */
const getPreSignedUrls = async function ({ cpfExportRepository, cpfExportsStorage }) {
  const filenames = await cpfExportRepository.findFileNamesByStatus({ cpfImportStatus: CpfImportStatus.READY_TO_SEND });

  return cpfExportsStorage.preSignFiles({
    keys: filenames,
  });
};

export { getPreSignedUrls };
