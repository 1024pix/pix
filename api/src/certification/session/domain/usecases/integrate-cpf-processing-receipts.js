import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import bluebird from 'bluebird';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../../lib/infrastructure/constants.js';

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

async function _updateCertificationCourses({ cpfReceipt, cpfReceiptsStorage, cpfCertificationResultRepository }) {
  const cpfInfos = await cpfReceiptsStorage.getCpfInfosByReceipt({ cpfReceipt });

  await bluebird.map(cpfInfos, async (cpfInfos) => cpfCertificationResultRepository.updateCpfInfos({ cpfInfos }), {
    concurrency: CONCURRENCY_HEAVY_OPERATIONS,
  });
  logger.debug('CPF receipt integrated %o', cpfReceipt);
}
