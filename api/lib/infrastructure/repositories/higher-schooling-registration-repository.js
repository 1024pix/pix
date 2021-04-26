const _ = require('lodash');
const { SchoolingRegistrationsCouldNotBeSavedError } = require('../../domain/errors');
const { knex } = require('../bookshelf');
const BookshelfSchoolingRegistration = require('../data/schooling-registration');
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
  'isSupernumerary',
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

  async saveNonSupernumerary(higherSchoolingRegistration, domainTransaction = DomainTransaction.emptyTransaction()) {
    const attributes = {
      ..._.pick(higherSchoolingRegistration, ATTRIBUTES_TO_SAVE),
      status: higherSchoolingRegistration.studyScheme,
    };

    try {
      await BookshelfSchoolingRegistration
        .where({
          studentNumber: attributes.studentNumber,
          organizationId: attributes.organizationId,
          isSupernumerary: false,
        })
        .save(attributes, { method: 'update', transacting: domainTransaction.knexTransaction });
    } catch (error) {
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async batchCreate(higherSchoolingRegistrations, domainTransaction = DomainTransaction.emptyTransaction()) {
    const registrationsToInsert = higherSchoolingRegistrations.map((registration) => ({
      ..._.pick(registration, ATTRIBUTES_TO_SAVE),
      status: registration.studyScheme,
    }));

    try {
      await knex
        .batchInsert('schooling-registrations', registrationsToInsert)
        .transacting(domainTransaction.knexTransaction);
    } catch (error) {
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async findByOrganizationIdAndStudentNumber({ organizationId, studentNumber }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
      })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async updateStudentNumber(studentId, studentNumber) {
    await BookshelfSchoolingRegistration
      .where('id', studentId)
      .save({ studentNumber }, {
        patch: true,
      });
  },

  async findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } = {} }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.where('isSupernumerary', false);
        if (birthdate) qb.where('birthdate', birthdate);
        if (studentNumber) qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
      })
      .fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async findStudentNumbersNonSupernumerary(organizationId, domainTransaction = DomainTransaction.emptyTransaction()) {
    const results = await knex('schooling-registrations')
      .select('studentNumber')
      .where({ organizationId, isSupernumerary: false })
      .transacting(domainTransaction.knexTransaction);

    return _.map(results, 'studentNumber');
  },

  findSupernumerary(organizationId, domainTransaction = DomainTransaction.emptyTransaction()) {
    return knex('schooling-registrations')
      .select('studentNumber', 'firstName', 'id', 'lastName', 'birthdate')
      .where({ organizationId, isSupernumerary: true })
      .transacting(domainTransaction.knexTransaction);
  },
};
