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

  async saveByStudentNumber(higherSchoolingRegistration, domainTransaction = DomainTransaction.emptyTransaction()) {
    const attributes = {
      ..._.pick(higherSchoolingRegistration, ATTRIBUTES_TO_SAVE),
      status: higherSchoolingRegistration.studyScheme,
    };

    try {
      await BookshelfSchoolingRegistration
        .where({
          studentNumber: attributes.studentNumber,
          organizationId: attributes.organizationId,
        })
        .save(attributes, { method: 'update', transacting: domainTransaction.knexTransaction });
    } catch (error) {
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async batchCreate(higherSchoolingRegistrations, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;

    const registrationsToInsert = higherSchoolingRegistrations.map((registration) => ({
      ..._.pick(registration, ATTRIBUTES_TO_SAVE),
      status: registration.studyScheme,
    }));

    try {
      await knexConn
        .batchInsert('schooling-registrations', registrationsToInsert);
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

  async findOneRegisteredByOrganizationIdAndUserData({ organizationId, reconciliationInfo: { birthdate, studentNumber } = {} }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.where('birthdate', birthdate);
        qb.whereRaw('LOWER(?)=LOWER(??)', [studentNumber, 'studentNumber']);
      })
      .fetch({ require: false });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async findStudentNumbersByOrganization(organizationId, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const results = await knex('schooling-registrations')
      .select('studentNumber')
      .where({ organizationId })
      .transacting(knexConn);

    return _.map(results, 'studentNumber');
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
};
