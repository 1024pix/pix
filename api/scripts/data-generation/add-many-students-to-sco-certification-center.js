import _ from 'lodash';
import { SCO_MIDDLE_SCHOOL_ID } from '../../db/seeds/data/organizations-sco-builder.js';
import { OrganizationLearner } from '../../lib/domain/models/OrganizationLearner.js';
import { OrganizationLearnersCouldNotBeSavedError } from '../../lib/domain/errors.js';
import { DomainTransaction } from '../../lib/infrastructure/DomainTransaction.js';
import { knex, disconnect } from '../../db/knex-database-connection.js';

function _buildOrganizationLearner(iteration) {
  const birthdates = ['2001-01-05', '2002-11-15', '1995-06-25'];
  const divisions = ['5eme', '4eme', '3eme'];
  return new OrganizationLearner({
    firstName: `someFirstName${iteration}`,
    lastName: `someLastName${iteration}`,
    birthdate: birthdates[_.random(0, 2)],
    division: divisions[_.random(0, 2)],
    organizationId: SCO_MIDDLE_SCHOOL_ID,
  });
}

async function addManyStudentsToScoCertificationCenter(numberOfStudents) {
  const manyStudents = _.times(numberOfStudents, _buildOrganizationLearner);
  try {
    await knex
      .batchInsert('organization-learners', manyStudents)
      .transacting(DomainTransaction.emptyTransaction().knexTransaction);
  } catch (err) {
    throw new OrganizationLearnersCouldNotBeSavedError();
  }
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting adding SCO students to certification center.');

  const numberOfStudents = process.argv[2];

  await addManyStudentsToScoCertificationCenter(numberOfStudents);

  console.log('\nDone.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { addManyStudentsToScoCertificationCenter };
