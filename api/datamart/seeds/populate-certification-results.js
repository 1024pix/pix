import { faker } from '@faker-js/faker';

import caseINEok from './cases/ine-ok.js';
import caseSameINEDifferentPerson from './cases/same-INE-different-person.js';
import caseSamePersonDifferentBirthdate from './cases/same-person-different-birthdate.js';
import caseSpecialNames from './cases/special-names.js';
import caseUAIok from './cases/uai-ok.js';
import caseVerificationCodeOK from './cases/verification-code-ok.js';

const NUMBER_OF_SEEDS = Number(process.env.DATAMART_NUMBER_OF_SEEDS) || 100;

const insertScoDatamart = async (knex) => {
  const scoDatamart = 'data_export_parcoursup_certif_result';

  await knex(scoDatamart).truncate();

  // Case 1 : INE ok
  await knex.batchInsert(scoDatamart, faker.helpers.multiple(caseINEok, { count: NUMBER_OF_SEEDS }).flat());
  // Case 2 : UAI ok
  await knex.batchInsert(scoDatamart, faker.helpers.multiple(caseUAIok, { count: NUMBER_OF_SEEDS }).flat());
  // Case 3 : Same INE different persons
  await knex.batchInsert(
    scoDatamart,
    faker.helpers.multiple(caseSameINEDifferentPerson, { count: NUMBER_OF_SEEDS }).flat(),
  );
  // Case 4 : Same person but different birthdate
  await knex.batchInsert(
    scoDatamart,
    faker.helpers.multiple(caseSamePersonDifferentBirthdate, { count: NUMBER_OF_SEEDS }).flat(),
  );
  // Case 5 : Complicated names (accents, dashes)
  await knex.batchInsert(scoDatamart, faker.helpers.multiple(caseSpecialNames, { count: 1 }).flat());
};

const insertGeneralPublicDatamart = async (knex) => {
  const generalPublicDatamart = 'data_export_parcoursup_certif_result_code_validation';
  await knex(generalPublicDatamart).truncate();
  await knex.batchInsert(
    generalPublicDatamart,
    faker.helpers.multiple(caseVerificationCodeOK, { count: NUMBER_OF_SEEDS }).flat(),
  );
};

export async function seed(knex) {
  await insertScoDatamart(knex);
  await insertGeneralPublicDatamart(knex);
}
