import _ from 'lodash';
import randomString from 'randomstring';
import OrganizationLearner from '../../lib/domain/models/OrganizationLearner';
import { OrganizationLearnersCouldNotBeSavedError } from '../../lib/domain/errors';
import { knex, disconnect } from '../../db/knex-database-connection';

function _buildOrganizationLearner(division, organizationId, iteration) {
  const birthdates = ['2001-01-05', '2002-11-15', '1995-06-25'];
  return new OrganizationLearner({
    firstName: `someFirstName${iteration}`,
    lastName: `someLastName${iteration}`,
    birthdate: birthdates[_.random(0, 2)],
    division,
    organizationId,
  });
}

async function addManyDivisionsAndStudentsToScoCertificationCenter(numberOfDivisions, organizationId) {
  const divisions = [];
  for (let i = 0; i < numberOfDivisions; ++i) {
    const letters = randomString.generate({
      length: 2,
      charset: 'alphabetic',
      capitalization: 'uppercase',
      readable: true,
    });
    const numbers = randomString.generate({ length: 1, charset: 'numeric', readable: true });

    const generatedDivision = letters.concat(numbers);
    if (_.find(divisions, (division) => division === generatedDivision)) {
      --i;
    } else {
      divisions.push(generatedDivision);
    }
  }
  const numberOfStudentsPerDivision = 30;

  const manyStudents = _.flatMap(divisions, (division) => {
    return _.times(numberOfStudentsPerDivision, (iteration) =>
      _buildOrganizationLearner(division, organizationId, iteration)
    );
  });

  try {
    await knex.batchInsert('organization-learners', manyStudents);
  } catch (err) {
    throw new OrganizationLearnersCouldNotBeSavedError();
  }
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting adding SCO students to certification center.');

  const numberOfDivisions = process.argv[2];
  const organizationId = process.argv[3];

  await addManyDivisionsAndStudentsToScoCertificationCenter(numberOfDivisions, organizationId);

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

export default {
  addManyDivisionsAndStudentsToScoCertificationCenter,
};
