/**
 * @typedef {import('./index.js').CpfReceiptsStorage} CpfReceiptsStorage
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').CpfCertificationResultRepository} CpfCertificationResultRepository
 */
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../../lib/infrastructure/constants.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';

/**
 * @param {Object} params
 * @param {CpfReceiptsStorage} params.cpfReceiptsStorage
 * @param {CpfCertificationResultRepository} params.cpfCertificationResultRepository
 */
const integrateCpfProccessingReceipts = async function ({ cpfReceiptsStorage, cpfCertificationResultRepository }) {
  logger.info('Starting CPF receipts integration from external storage');

  const cpfReceipts = await cpfReceiptsStorage.findAll();
  for (const cpfReceipt of cpfReceipts) {
    try {
      logger.debug('Integration of CPF receipt %o', cpfReceipt);
      await _updateCertificationCourses({ cpfReceipt, cpfReceiptsStorage, cpfCertificationResultRepository });

      logger.debug('Delete CPF receipt %o', cpfReceipt);
      await cpfReceiptsStorage.deleteReceipt({ cpfReceipt });
    } catch (error) {
      // Do not block next CPF receipt integration
      logger.error('An error occured while integrating a CPF receipt', error);
    }
  }

  logger.info('%d CPF receipts integrated', cpfReceipts.length);
};

export { integrateCpfProccessingReceipts };

/**
 * @param {Object} params
 * @param {CpfReceiptsStorage} params.cpfReceiptsStorage
 * @param {CpfCertificationResultRepository} params.cpfCertificationResultRepository
 */
async function _updateCertificationCourses({ cpfReceipt, cpfReceiptsStorage, cpfCertificationResultRepository }) {
  const cpfInfos = await cpfReceiptsStorage.getCpfInfosByReceipt({ cpfReceipt });

  await PromiseUtils.map(cpfInfos, async (cpfInfos) => cpfCertificationResultRepository.updateCpfInfos({ cpfInfos }), {
    concurrency: CONCURRENCY_HEAVY_OPERATIONS,
  });
  logger.info('%d certification courses updated from CPF receipt %s', cpfInfos.length, cpfReceipt.filename);
}
