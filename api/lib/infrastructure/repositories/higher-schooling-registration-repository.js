const _ = require('lodash');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../domain/errors');
const { knex } = require('../bookshelf');
const BookshelfSchoolingRegistration = require('../orm-models/SchoolingRegistration');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');

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

  async save(higherSchoolingRegistration, domainTransaction = DomainTransaction.emptyTransaction()) {
    const attributes = {
      ..._.pick(higherSchoolingRegistration, ATTRIBUTES_TO_SAVE),
      status: higherSchoolingRegistration.studyScheme,
    };

    try {
      await BookshelfSchoolingRegistration
        .where({ id: higherSchoolingRegistration.id })
        .save(attributes, { method: 'update', transacting: domainTransaction.knexTransaction });
    } catch (error) {
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async upsertStudents(higherSchoolingRegistrations) {
    const registrationsToInsert = higherSchoolingRegistrations.map((registration) => ({
      ..._.pick(registration, ATTRIBUTES_TO_SAVE),
      status: registration.studyScheme,
    }));

    try {
      await knex('schooling-registrations')
        .insert(registrationsToInsert)
        .onConflict(['organizationId', 'studentNumber'])
        .merge();
    } catch (error) {
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async updateStudentNumber(studentId, studentNumber) {
    await BookshelfSchoolingRegistration
      .where('id', studentId)
      .save({ studentNumber }, {
        patch: true,
      });
  },

  async findOneByStudentNumberAndBirthdate({ organizationId, studentNumber, birthdate }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.where('birthdate', birthdate);
        qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
      })
      .fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async findOneByStudentNumber({ organizationId, studentNumber }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
      })
      .fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },
};
