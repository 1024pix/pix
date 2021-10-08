const _ = require('lodash');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../domain/errors');
const { knex } = require('../bookshelf');
const BookshelfSchoolingRegistration = require('../orm-models/SchoolingRegistration');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

const ATTRIBUTES_TO_SAVE = [
  'firstName',
  'middleName',
  'thirdName',
  'lastName',
  'preferredLastName',
  'studentNumber',
  'email',
  'diploma',
  'department',
  'educationalTeam',
  'group',
  'status',
  'birthdate',
  'organizationId',
];

module.exports = {
  async updateStudentNumber(studentId, studentNumber) {
    await BookshelfSchoolingRegistration.where('id', studentId).save(
      { studentNumber },
      {
        patch: true,
      }
    );
  },

  async findOneByStudentNumberAndBirthdate({ organizationId, studentNumber, birthdate }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.where('birthdate', birthdate);
      qb.where('isDisabled', false);
      qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
    }).fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async findOneByStudentNumber({ organizationId, studentNumber }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
    }).fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async addStudents(higherSchoolingRegistrations) {
    await _upsertStudents(knex, higherSchoolingRegistrations);
  },

  async replaceStudents(organizationId, higherSchoolingRegistrations) {
    await knex.transaction(async (transaction) => {
      await _disableAllRegistrations(transaction, organizationId);
      await _upsertStudents(transaction, higherSchoolingRegistrations);
    });
  },
};

async function _disableAllRegistrations(queryBuilder, organizationId) {
  await queryBuilder('schooling-registrations')
    .update({ isDisabled: true, updatedAt: knex.raw('CURRENT_TIMESTAMP') })
    .where({ organizationId, isDisabled: false });
}

async function _upsertStudents(queryBuilder, higherSchoolingRegistrations) {
  const registrationsToInsert = higherSchoolingRegistrations.map((registration) => ({
    ..._.pick(registration, ATTRIBUTES_TO_SAVE),
    status: registration.studyScheme,
    isDisabled: false,
    updatedAt: knex.raw('CURRENT_TIMESTAMP'),
  }));

  try {
    await queryBuilder('schooling-registrations')
      .insert(registrationsToInsert)
      .onConflict(['organizationId', 'studentNumber'])
      .merge();
  } catch (error) {
    throw new SchoolingRegistrationsCouldNotBeSavedError();
  }
}
