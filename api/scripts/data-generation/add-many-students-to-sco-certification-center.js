const { SCO_MIDDLE_SCHOOL_ID } = require('../../db/seeds/data/organizations-sco-builder');
const times = require('lodash/times');
const faker = require('faker');
const SchoolingRegistration = require('../../lib/domain/models/SchoolingRegistration');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../lib/domain/errors');
const { knex } = require('../../lib/infrastructure/bookshelf');
const DomainTransaction = require('../../lib/infrastructure/DomainTransaction');

function _buildSchoolingRegistration() {
  return new SchoolingRegistration({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    birthdate: faker.date.past(),
    division: faker.lorem.word(),
    organizationId: SCO_MIDDLE_SCHOOL_ID,
  });
}

async function addManyStudentsToScoCertificationCenter(numberOfStudents) {
  const manyStudents = times(numberOfStudents, _buildSchoolingRegistration);
  try {
    await knex
      .batchInsert('schooling-registrations', manyStudents)
      .transacting(DomainTransaction.emptyTransaction().knexTransaction);
  } catch (err) {
    throw new SchoolingRegistrationsCouldNotBeSavedError();
  }
}

async function main() {
  console.log('Starting adding SCO students to certification center.');

  const numberOfStudents = process.argv[2];

  await addManyStudentsToScoCertificationCenter(numberOfStudents);

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
  addManyStudentsToScoCertificationCenter,
};
