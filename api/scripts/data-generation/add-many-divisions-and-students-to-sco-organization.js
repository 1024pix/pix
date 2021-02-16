const _ = require('lodash');
const randomString = require('randomstring');
const SchoolingRegistration = require('../../lib/domain/models/SchoolingRegistration');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../lib/domain/errors');
const { knex } = require('../../lib/infrastructure/bookshelf');

function _buildSchoolingRegistration(division, organizationId, iteration) {
  const birthdates = [
    '2001-01-05',
    '2002-11-15',
    '1995-06-25',
  ];
  return new SchoolingRegistration({
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
    const letters = randomString.generate({ length: 2, charset: 'alphabetic', capitalization: 'uppercase', readable: true });
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
    return _.times(numberOfStudentsPerDivision, (iteration) => _buildSchoolingRegistration(division, organizationId, iteration));
  });

  try {
    await knex
      .batchInsert('schooling-registrations', manyStudents);
  } catch (err) {
    throw new SchoolingRegistrationsCouldNotBeSavedError();
  }
}

async function main() {
  console.log('Starting adding SCO students to certification center.');

  const numberOfDivisions = process.argv[2];
  const organizationId = process.argv[3];

  await addManyDivisionsAndStudentsToScoCertificationCenter(numberOfDivisions, organizationId);

  console.log('\nDone.');
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

module.exports = {
  addManyDivisionsAndStudentsToScoCertificationCenter,
};
