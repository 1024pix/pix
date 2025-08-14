/**
 * @typedef {import('./index.js').CpfExportsStorage} CpfExportsStorage
 */
/**
 * @typedef {import('./index.js').CpfExportRepository} CpfExportRepository
 */
import { cpfExportRepository as injectedCpfExportRepository } from '../../infrastructure/repositories/index.js';
import { cpfExportsStorage as injectedCpfExportsStorage } from '../../infrastructure/storage/cpf-exports-storage.js';
import { CpfImportStatus } from '../models/CpfImportStatus.js';

/**
 * @param {Object} params
 * @param {CpfExportsStorage} params.cpfExportsStorage
 * @param {CpfExportRepository} params.cpfExportRepository
 */
const getPreSignedUrls = async function ({
  cpfExportRepository = injectedCpfExportRepository,
  cpfExportsStorage = injectedCpfExportsStorage,
} = {}) {
  const filenames = await cpfExportRepository.findFileNamesByStatus({ cpfImportStatus: CpfImportStatus.READY_TO_SEND });

  return cpfExportsStorage.preSignFiles({
    keys: filenames,
  });
};

export { getPreSignedUrls };
