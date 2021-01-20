const times = require('lodash/times');
const flatMap = require('lodash/flatMap');
const faker = require('faker');
const SchoolingRegistration = require('../../lib/domain/models/SchoolingRegistration');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../lib/domain/errors');
const { knex } = require('../../lib/infrastructure/bookshelf');

function _buildSchoolingRegistration(division, organizationId) {
  return new SchoolingRegistration({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    birthdate: faker.date.past(),
    division,
    organizationId,
  });
}

async function addManyDivisionsAndStudentsToScoCertificationCenter(numberOfDivisions, organizationId) {
  const divisions = times(numberOfDivisions, () => faker.random.alphaNumeric(5));
  const numberOfStudentsPerDivision = 30;

  const manyStudents = flatMap(divisions, (division) => {
    const students = times(numberOfStudentsPerDivision, () => _buildSchoolingRegistration(division, organizationId));
    return students;
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
