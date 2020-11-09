const { MIDDLE_SCHOOL_ID } = require('../db/seeds/data/organizations-sco-builder');
const times = require('lodash/times');
const faker = require('faker');
const SchoolingRegistration = require('../lib/domain/models/SchoolingRegistration');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../lib/domain/errors');
const { knex } = require('../lib/infrastructure/bookshelf');
const DomainTransaction = require('../lib/infrastructure/DomainTransaction');

function buildSchoolingRegistration() {
  return new SchoolingRegistration({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    birthdate: faker.date.past(),
    division: faker.lorem.word(),
    organizationId: MIDDLE_SCHOOL_ID,
  });
}

async function addManyStudentsToScoCertificationCenter(numberOfStudents) {
  const manyStudents = times(numberOfStudents, () => buildSchoolingRegistration());
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

  try {
    await addManyStudentsToScoCertificationCenter(numberOfStudents);
    console.log('\nDone.');
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
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
