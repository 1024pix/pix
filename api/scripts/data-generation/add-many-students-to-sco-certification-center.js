const _ = require('lodash');
const { SCO_MIDDLE_SCHOOL_ID } = require('../../db/seeds/data/organizations-sco-builder');
const SchoolingRegistration = require('../../lib/domain/models/SchoolingRegistration');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../lib/domain/errors');
const { knex } = require('../../lib/infrastructure/bookshelf');
const DomainTransaction = require('../../lib/infrastructure/DomainTransaction');

function _buildSchoolingRegistration(iteration) {
  const birthdates = [
    '2001-01-05',
    '2002-11-15',
    '1995-06-25',
  ];
  const divisions = [
    '5eme',
    '4eme',
    '3eme',
  ];
  return new SchoolingRegistration({
    firstName: `someFirstName${iteration}`,
    lastName: `someLastName${iteration}`,
    birthdate: birthdates[_.random(0, 2)],
    division: divisions[_.random(0, 2)],
    organizationId: SCO_MIDDLE_SCHOOL_ID,
  });
}

async function addManyStudentsToScoCertificationCenter(numberOfStudents) {
  const manyStudents = _.times(numberOfStudents, _buildSchoolingRegistration);
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
