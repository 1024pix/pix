import { logger } from '../../../../shared/infrastructure/utils/logger.js';

const integrateCpfProccessingReceipts = async function ({ cpfReceiptsStorage }) {
  const cpfReceipts = await cpfReceiptsStorage.findAll();
  for (const cpfReceipt of cpfReceipts) {
    logger.debug('Treatment of CPF receipt %o', cpfReceipt);
    await cpfReceiptsStorage.readFile({ cpfReceipt });
  }
};

export { integrateCpfProccessingReceipts };
