import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { chunkify } from './cases/tools.js';
import caseVerificationCodeOK from './cases/verification-code/verification-code-only.js';

const NUMBER_OF_SEEDS = Number(process.env.DATAMART_NUMBER_OF_SEEDS) || 100;

const insertGeneralPublicDatamart = async (knex) => {
  logger.info('Start Case 6 : Verification code OK');
  const generalPublicDatamart = 'certification_results';
  await chunkify({
    numberOfSeeds: NUMBER_OF_SEEDS,
    knex,
    datamart: generalPublicDatamart,
    generateFn: caseVerificationCodeOK,
  });
};

export async function seed(knex) {
  await insertGeneralPublicDatamart(knex);
}
