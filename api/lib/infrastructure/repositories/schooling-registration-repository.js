const _ = require('lodash');
const bluebird = require('bluebird');
const { NotFoundError, SameNationalStudentIdInOrganizationError, SchoolingRegistrationsCouldNotBeSavedError, UserCouldNotBeReconciledError } = require('../../domain/errors');
const UserWithSchoolingRegistration = require('../../domain/models/UserWithSchoolingRegistration');
const SchoolingRegistration = require('../../domain/models/SchoolingRegistration');
const studentRepository = require('./student-repository');

const Bookshelf = require('../bookshelf');
const BookshelfSchoolingRegistration = require('../data/schooling-registration');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const bookshelfUtils = require('../utils/knex-utils');

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

function _isReconciled(schoolingRegistration) {
  return schoolingRegistration.userId;
}

module.exports = {

  findByIds({ ids }) {
    const schoolingRegistrations = BookshelfSchoolingRegistration
      .where('id', 'in', ids)
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  _findByOrganizationId({ organizationId, orderByRaw }) {
    return BookshelfSchoolingRegistration
      .where({ organizationId })
      .query((qb) => qb.orderByRaw(orderByRaw))
      .fetchAll()
      .then((schoolingRegistrations) => bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations));
  },

  findByOrganizationId({ organizationId }) {
    return this._findByOrganizationId({ organizationId, orderByRaw: 'LOWER("lastName") ASC, LOWER("firstName") ASC' });
  },

  findByOrganizationIdOrderByDivision({ organizationId }) {
    return this._findByOrganizationId({ organizationId, orderByRaw: 'LOWER("division") ASC, LOWER("lastName") ASC, LOWER("firstName") ASC' });
  },

  async findByUserId({ userId }) {
    const schoolingRegistrations = await BookshelfSchoolingRegistration
      .where({ userId })
      .orderBy('id')
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  // FIXME find or get => on a uniquement besoin du nationalStudentId
  async findByUserIdAndSchoolingRegistrationIdAndSCOOrganization({ userId, schoolingRegistrationId }) {
    const schoolingRegistrations = await BookshelfSchoolingRegistration
      .query((qb) => qb.join('organizations', 'schooling-registrations.organizationId', 'organizations.id'))
      .where({ userId, type: 'SCO', 'schooling-registrations.id': schoolingRegistrationId })
      //FIXME do not fetch everything
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  async findByUserIdAndSCOOrganization({ userId }) {
    const schoolingRegistrations = await BookshelfSchoolingRegistration
      .query((qb) => qb.join('organizations', 'schooling-registrations.organizationId', 'organizations.id'))
      .where({ userId, type: 'SCO' })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  async addOrUpdateOrganizationSchoolingRegistrations(schoolingRegistrationDatas, organizationId) {

    const nationalStudentIdsFromFile = schoolingRegistrationDatas.map((schoolingRegistrationData) => schoolingRegistrationData.nationalStudentId);
    const students = await studentRepository.findReconciledStudentsByNationalStudentId(_.compact(nationalStudentIdsFromFile));

    const schoolingRegistrationsFromFile = schoolingRegistrationDatas.map((schoolingRegistrationData) => new SchoolingRegistration({ ...schoolingRegistrationData, organizationId }));
    const currentSchoolingRegistrations = await this.findByOrganizationId({ organizationId });

    const [ schoolingRegistrationsToUpdate, schoolingRegistrationsToCreate ] = _.partition(schoolingRegistrationsFromFile, (schoolingRegistration) => {
      const currentSchoolingRegistration   = currentSchoolingRegistrations.find((currentSchoolingRegistration) => currentSchoolingRegistration.nationalStudentId === schoolingRegistration.nationalStudentId);
      if (!currentSchoolingRegistration || !_isReconciled(currentSchoolingRegistration)) {
        const student = students.find((student) => student.nationalStudentId === schoolingRegistration.nationalStudentId);
        if (student) {
          schoolingRegistration.userId = student.account.userId;
        }
      }
      return !!currentSchoolingRegistration;
    });

    const trx = await Bookshelf.knex.transaction();
    try {
      await Promise.all([
        bluebird.mapSeries(schoolingRegistrationsToUpdate, async (schoolingRegistrationToUpdate) => {
          const attributesToUpdate = _.omit(schoolingRegistrationToUpdate, ['id', 'createdAt']);
          await trx('schooling-registrations')
            .where({
              'organizationId': organizationId,
              'nationalStudentId': schoolingRegistrationToUpdate.nationalStudentId,
            })
            .update({ ...attributesToUpdate, updatedAt: Bookshelf.knex.raw('CURRENT_TIMESTAMP') });
        }),
        trx.batchInsert('schooling-registrations', schoolingRegistrationsToCreate),
      ]);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new SameNationalStudentIdInOrganizationError(err.detail);
      }
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async findByOrganizationIdAndBirthdate({ organizationId, birthdate }) {
    const schoolingRegistrations = await BookshelfSchoolingRegistration
      .query((qb) => {
        qb.where('organizationId', organizationId);
        qb.where('birthdate', birthdate);
      })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  async reconcileUserToSchoolingRegistration({ userId, schoolingRegistrationId }) {
    const schoolingRegistration = await BookshelfSchoolingRegistration
      .where({ id: schoolingRegistrationId })
      .save({ userId }, {
        patch: true,
      });

    return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
  },

  async reconcileUserByNationalStudentIdAndOrganizationId({ nationalStudentId, userId, organizationId }) {
    try {
      const schoolingRegistration = await BookshelfSchoolingRegistration
        .where({ organizationId, nationalStudentId })
        .save({ userId }, { patch: true });
      return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
    } catch (error) {
      throw new UserCouldNotBeReconciledError();
    }
  },

  async dissociateUserFromSchoolingRegistration(schoolingRegistrationId) {
    await BookshelfSchoolingRegistration
      .where({ id: schoolingRegistrationId })
      .save({ userId: null }, {
        patch: true,
      });
  },

  async dissociateUserFromSchoolingRegistrationIds(schoolingRegistrationIds) {
    await BookshelfSchoolingRegistration
      .where('id', 'in', schoolingRegistrationIds)
      .save({ userId: null }, { patch: true });
  },

  findOneByUserIdAndOrganizationId({ userId, organizationId }) {
    return BookshelfSchoolingRegistration
      .where({ userId, organizationId })
      .fetch()
      .then((schoolingRegistration) => bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration));
  },

  async updateStudentNumber(studentId, studentNumber) {
    await BookshelfSchoolingRegistration
      .where('id', studentId)
      .save({ studentNumber }, {
        patch: true,
      });
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
          'schooling-registrations.studentNumber',
          'schooling-registrations.userId',
          'schooling-registrations.organizationId',
          'users.username',
          'users.email',
          'users.samlId',
        );
        qb.orderByRaw('LOWER("schooling-registrations"."lastName") ASC, LOWER("schooling-registrations"."firstName") ASC');
        qb.leftJoin('users', 'schooling-registrations.userId', 'users.id');
        qb.modify(_setSchoolingRegistrationFilters, filter);
      })
      .fetchPage({
        page: page.number,
        pageSize: page.size,
        withRelated: ['user'],
      });

    return {
      data: models.map(_toUserWithSchoolingRegistrationDTO),
      pagination,
    };
  },

};
