const _ = require('lodash');
const bluebird = require('bluebird');
const { NotFoundError, SameNationalStudentIdInOrganizationError, SchoolingRegistrationsCouldNotBeSavedError } = require('../../domain/errors');
const UserWithSchoolingRegistration = require('../../domain/models/UserWithSchoolingRegistration');
const SchoolingRegistration = require('../../domain/models/SchoolingRegistration');

const Bookshelf = require('../bookshelf');
const BookshelfSchoolingRegistration = require('../data/schooling-registration');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toUserWithSchoolingRegistrationDTO(BookshelfSchoolingRegistration) {

  const rawUserWithSchoolingRegistration = BookshelfSchoolingRegistration.toJSON();

  return new UserWithSchoolingRegistration({
    ...rawUserWithSchoolingRegistration,
    isAuthenticatedFromGAR: (rawUserWithSchoolingRegistration.samlId) ? true : false,
  });
}

function _setSchoolingRegistrationFilters(qb, { lastName, firstName, connexionType } = {}) {
  if (lastName) {
    qb.whereRaw('LOWER("schooling-registrations"."lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (firstName) {
    qb.whereRaw('LOWER("schooling-registrations"."firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (connexionType === 'none') {
    qb.whereRaw('"users"."username" IS NULL');
    qb.whereRaw('"users"."email" IS NULL');
    qb.whereRaw('"users"."samlId" IS NULL');
  } else if (connexionType === 'identifiant') {
    qb.whereRaw('"users"."username" IS NOT NULL');
  } else if (connexionType === 'email') {
    qb.whereRaw('"users"."email" IS NOT NULL');
  } else if (connexionType === 'mediacentre') {
    qb.whereRaw('"users"."samlId" IS NOT NULL');
  }
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

  async associateUserAndSchoolingRegistration({ userId, schoolingRegistrationId }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .where({ id: schoolingRegistrationId })
      .save({ userId }, {
        patch: true,
      });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async dissociateUserFromSchoolingRegistration(schoolingRegistrationId) {
    await BookshelfSchoolingRegistration
      .where({ id: schoolingRegistrationId })
      .save({ userId: null }, {
        patch: true,
      });
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

  async findPaginatedFilteredSchoolingRegistrations({ organizationId, filter, page = {} }) {
    const { models, pagination }  = await BookshelfSchoolingRegistration
      .where({ organizationId })
      .query((qb) => {
        qb.select(
          'schooling-registrations.id',
          'schooling-registrations.firstName',
          'schooling-registrations.lastName',
          'schooling-registrations.birthdate',
          'schooling-registrations.userId',
          'schooling-registrations.organizationId',
          'users.username',
          'users.email',
          'users.samlId'
        );
        qb.orderByRaw('LOWER("schooling-registrations"."lastName") ASC, LOWER("schooling-registrations"."firstName") ASC');
        qb.leftJoin('users', 'schooling-registrations.userId', 'users.id');
        qb.modify(_setSchoolingRegistrationFilters, filter);
      })
      .fetchPage({
        page: page.number,
        pageSize: page.size,
        withRelated: ['user']
      });

    return {
      data: models.map(_toUserWithSchoolingRegistrationDTO),
      pagination,
    };
  },
};
