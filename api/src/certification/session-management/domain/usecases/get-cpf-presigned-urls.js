/**
 * @typedef {import('../../../shared/domain/usecases/index.js').CpfExportsStorage} CpfExportsStorage
 */
/**
 * @typedef {import('../../../shared/domain/usecases/index.js').CpfExportRepository} CpfExportRepository
 */
import { CpfImportStatus } from '../models/CpfImportStatus.js';

/**
 * @param {Object} params
 * @param {CpfExportsStorage} params.cpfExportsStorage
 * @param {CpfExportRepository} params.cpfExportRepository
 */
const getPreSignedUrls = async function ({ cpfExportRepository, cpfExportsStorage }) {
  const filenames = await cpfExportRepository.findFileNamesByStatus({ cpfImportStatus: CpfImportStatus.READY_TO_SEND });

  return cpfExportsStorage.preSignFiles({
    keys: filenames,
  });
};

export { getPreSignedUrls };
