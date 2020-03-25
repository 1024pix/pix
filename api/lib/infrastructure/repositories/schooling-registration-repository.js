const _ = require('lodash');
const bluebird = require('bluebird');
const { NotFoundError, SameNationalStudentIdInOrganizationError, SchoolingRegistrationsCouldNotBeSavedError } = require('../../domain/errors');
const StudentWithUserInfo = require('../../domain/models/StudentWithUserInfo');
const SchoolingRegistration = require('../../domain/models/SchoolingRegistration');

const Bookshelf = require('../bookshelf');
const BookshelfSchoolingRegistration = require('../data/schooling-registration');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toStudentWithUserInfoDTO(BookshelfSchoolingRegistration) {

  const rawStudentWithUserInfo = BookshelfSchoolingRegistration.toJSON();

  return new StudentWithUserInfo({
    ...rawStudentWithUserInfo,
    isAuthenticatedFromGAR: (rawStudentWithUserInfo.samlId) ? true : false,
  });
}

module.exports = {

  findByOrganizationId({ organizationId }) {
    return BookshelfSchoolingRegistration
      .where({ organizationId })
      .query((qb) => {
        qb.orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC');
      })
      .fetchAll()
      .then((schoolingRegistrations) => bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations));
  },

  async addOrUpdateOrganizationSchoolingRegistrations(schoolingRegistrationDatas, organizationId) {
    const trx = await Bookshelf.knex.transaction();

    try {

      const schoolingRegistrations = _.map(schoolingRegistrationDatas, (schoolingRegistrationData) => new SchoolingRegistration({ ...schoolingRegistrationData, organizationId }));
      const schoolingRegistrationsFromOrganization = await this.findByOrganizationId({ organizationId });
      const nationalStudentIdsFromOrganization = _.map(schoolingRegistrationsFromOrganization, 'nationalStudentId');
      const [ schoolingRegistrationsToUpdate, schoolingRegistrationsToCreate ] = _.partition(schoolingRegistrations, (schoolingRegistration) => _.includes(nationalStudentIdsFromOrganization, schoolingRegistration.nationalStudentId));

      await bluebird.mapSeries(schoolingRegistrationsToUpdate, async (schoolingRegistrationToUpdate) => {
        await trx('schooling-registrations')
          .where({
            'organizationId': organizationId,
            'nationalStudentId': schoolingRegistrationToUpdate.nationalStudentId,
          })
          .update(_.omit(schoolingRegistrationToUpdate, ['id', 'createdAt']));
      });

      await Bookshelf.knex.batchInsert('schooling-registrations', schoolingRegistrationsToCreate);

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new SameNationalStudentIdInOrganizationError(err.detail);
      }
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  findByOrganizationIdAndUserBirthdate({ organizationId, birthdate }) {
    return BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.where('birthdate', birthdate);
      })
      .fetchAll()
      .then((schoolingRegistrations) => bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations));
  },

  associateUserAndSchoolingRegistration({ userId, schoolingRegistrationId }) {
    return BookshelfSchoolingRegistration
      .where({ id: schoolingRegistrationId })
      .save({ userId }, {
        patch: true,
      })
      .then((schoolingRegistration) => bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration));
  },

  findOneByUserIdAndOrganizationId({ userId, organizationId }) {
    return BookshelfSchoolingRegistration
      .where({ userId, organizationId })
      .fetch()
      .then((schoolingRegistration) => bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration));
  },

  get(schoolingRegistrationId) {
    return BookshelfSchoolingRegistration
      .where({ id: schoolingRegistrationId })
      .fetch({ require: true })
      .then((schoolingRegistration) => bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration))
      .catch((err) => {
        if (err instanceof BookshelfSchoolingRegistration.NotFoundError) {
          throw new NotFoundError(`Student not found for ID ${schoolingRegistrationId}`);
        }
        throw err;
      });
  },

  findSchoolingRegistrationsWithUserInfoByOrganizationId({ organizationId }) {
    return BookshelfSchoolingRegistration
      .where({ organizationId })
      .query((qb) => {
        qb.orderByRaw('LOWER("schooling-registrations"."lastName") ASC, LOWER("schooling-registrations"."firstName") ASC');
        qb.leftJoin('users', 'schooling-registrations.userId', 'users.id');
      })
      .fetchAll({ columns: ['schooling-registrations.id','schooling-registrations.firstName', 'schooling-registrations.lastName', 'schooling-registrations.birthdate', 'schooling-registrations.userId', 'schooling-registrations.organizationId' , 'users.username' , 'users.email' , 'users.samlId' , ] })
      .then((schoolingRegistrations) => schoolingRegistrations.models.map(_toStudentWithUserInfoDTO));
  },
};
