import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import caseINEok from './cases/sco/ine-ok.js';
import caseSameINEDifferentPerson from './cases/sco/same-ine-different-person.js';
import caseSamePersonDifferentBirthdate from './cases/sco/same-person-different-birthdate.js';
import caseSpecialNames from './cases/sco/special-names.js';
import caseUAIok from './cases/sco/uai-ok.js';
import { chunkify } from './cases/tools.js';

const NUMBER_OF_SEEDS = Number(process.env.DATAMART_NUMBER_OF_SEEDS) || 100;

const insertScoDatamart = async (knex) => {
  const scoDatamart = 'sco_certification_results';

  logger.info('Start Case 1 : INE ok');
  await chunkify({ numberOfSeeds: NUMBER_OF_SEEDS, knex, datamart: scoDatamart, generateFn: caseINEok });

  logger.info('Start Case 2 : UAI ok');
  await chunkify({ numberOfSeeds: NUMBER_OF_SEEDS, knex, datamart: scoDatamart, generateFn: caseUAIok });

  logger.info('Start Case 3 : Same INE different persons');
  await chunkify({
    numberOfSeeds: NUMBER_OF_SEEDS,
    knex,
    datamart: scoDatamart,
    generateFn: caseSameINEDifferentPerson,
  });

  logger.info('Start Case 4 : Same person but different birthdate');
  await chunkify({
    numberOfSeeds: NUMBER_OF_SEEDS,
    knex,
    datamart: scoDatamart,
    generateFn: caseSamePersonDifferentBirthdate,
  });

  logger.info('Start Case 5 : Complicated names (accents, dashes)');
  await chunkify({ numberOfSeeds: NUMBER_OF_SEEDS, knex, datamart: scoDatamart, generateFn: caseSpecialNames });
};

export async function seed(knex) {
  await insertScoDatamart(knex);
}
