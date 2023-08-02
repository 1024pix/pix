import _ from 'lodash';
import { OrganizationLearner } from '../../lib/domain/models/index.js';
import { OrganizationLearnersCouldNotBeSavedError } from '../../lib/domain/errors.js';
import { DomainTransaction } from '../../lib/infrastructure/DomainTransaction.js';
import { knex, disconnect } from '../../db/knex-database-connection.js';
import * as url from 'url';

// Change me to run the script on appropriate organization
const organizationId = 123;

function _buildOrganizationLearner(iteration) {
  const birthdates = ['2001-01-05', '2002-11-15', '1995-06-25'];
  const divisions = ['5eme', '4eme', '3eme'];
  return new OrganizationLearner({
    firstName: `someFirstName${iteration}`,
    lastName: `someLastName${iteration}`,
    birthdate: birthdates[_.random(0, 2)],
    division: divisions[_.random(0, 2)],
    organizationId: organizationId,
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

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

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
