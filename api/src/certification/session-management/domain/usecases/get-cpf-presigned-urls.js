/**
 * @typedef {import('./index.js').CpfExportsStorage} CpfExportsStorage
 */
/**
 * @typedef {import('./index.js').CpfExportRepository} CpfExportRepository
 */
import { CpfImportStatus } from '../models/CpfImportStatus.js';

/**
 * @param {object} params
 * @param {CpfExportsStorage} params.cpfExportsStorage
 * @param {CpfExportRepository} params.cpfExportRepository
 */
export async function getPreSignedUrls({ cpfExportRepository, cpfExportsStorage }) {
  const filenames = await cpfExportRepository.findFileNamesByStatus({ cpfImportStatus: CpfImportStatus.READY_TO_SEND });

  return cpfExportsStorage.preSignFiles({
    keys: filenames,
  });
}
