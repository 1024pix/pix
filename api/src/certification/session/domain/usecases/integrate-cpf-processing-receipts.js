import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import bluebird from 'bluebird';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../../../lib/infrastructure/constants.js';

const integrateCpfProccessingReceipts = async function ({ cpfReceiptsStorage, cpfCertificationResultRepository }) {
  const cpfReceipts = await cpfReceiptsStorage.findAll();
  for (const cpfReceipt of cpfReceipts) {
    logger.debug('Treatment of CPF receipt %o', cpfReceipt);
    const cpfInfos = await cpfReceiptsStorage.getCpfInfosByReceipt({ cpfReceipt });

    await bluebird.map(cpfInfos, async (cpfInfos) => cpfCertificationResultRepository.updateCpfInfos({ cpfInfos }), {
      concurrency: CONCURRENCY_HEAVY_OPERATIONS,
    });
  }
};

export { integrateCpfProccessingReceipts };
