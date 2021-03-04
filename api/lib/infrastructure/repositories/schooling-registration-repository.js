const _ = require('lodash');
const bluebird = require('bluebird');

const {
  NotFoundError,
  SameNationalStudentIdInOrganizationError,
  SameNationalApprenticeIdInOrganizationError,
  SchoolingRegistrationNotFound,
  SchoolingRegistrationsCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
} = require('../../domain/errors');

const UserWithSchoolingRegistration = require('../../domain/models/UserWithSchoolingRegistration');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const SchoolingRegistration = require('../../domain/models/SchoolingRegistration');
const studentRepository = require('./student-repository');

const Bookshelf = require('../bookshelf');
const BookshelfSchoolingRegistration = require('../data/schooling-registration');

const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const bookshelfUtils = require('../utils/knex-utils');
const DomainTransaction = require('../DomainTransaction');

const STATUS = SchoolingRegistration.STATUS;

function _toUserWithSchoolingRegistrationDTO(BookshelfSchoolingRegistration) {
  const rawUserWithSchoolingRegistration = BookshelfSchoolingRegistration.toJSON();

  return new UserWithSchoolingRegistration({
    ...rawUserWithSchoolingRegistration,
    isAuthenticatedFromGAR: !!rawUserWithSchoolingRegistration.samlId,
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
    // we only retrieve GAR authentication method in join clause
    qb.whereRaw('"authentication-methods"."externalIdentifier" IS NULL');
  } else if (connexionType === 'identifiant') {
    qb.whereRaw('"users"."username" IS NOT NULL');
  } else if (connexionType === 'email') {
    qb.whereRaw('"users"."email" IS NOT NULL');
  } else if (connexionType === 'mediacentre') {
    // we only retrieve GAR authentication method in join clause
    qb.whereRaw('"authentication-methods"."externalIdentifier" IS NOT NULL');
  }
}

function _isReconciled(schoolingRegistration) {
  return Boolean(schoolingRegistration.userId);
}

module.exports = {

  findByIds({ ids }) {
    const schoolingRegistrations = BookshelfSchoolingRegistration
      .where('id', 'in', ids)
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  findByOrganizationId({ organizationId }) {
    return BookshelfSchoolingRegistration
      .where({ organizationId })
      .query((qb) => qb.orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC'))
      .fetchAll()
      .then((schoolingRegistrations) => bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations));
  },

  async findByOrganizationIdAndUpdatedAtOrderByDivision({ organizationId, page, filter }) {
    const BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-08-15';
    const query = BookshelfSchoolingRegistration
      .where((qb) => {
        qb.where({ organizationId });
        qb.where('updatedAt', '>', BEGINNING_OF_THE_2020_SCHOOL_YEAR);
      })
      .query((qb) => {
        qb.orderByRaw('LOWER("division") ASC, LOWER("lastName") ASC, LOWER("firstName") ASC');
        if (filter.divisions) {
          qb.whereIn('division', filter.divisions);
        }
      })
      .fetchPage({
        page: page.number,
        pageSize: page.size,
      });

    const { models, pagination } = await query;

    return {
      data: bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, models),
      pagination,
    };
  },

  async findByUserId({ userId }) {
    const schoolingRegistrations = await BookshelfSchoolingRegistration
      .where({ userId })
      .orderBy('id')
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  async isSchoolingRegistrationIdLinkedToUserAndSCOOrganization({ userId, schoolingRegistrationId }) {
    const exist = await Bookshelf.knex('schooling-registrations')
      .select('schooling-registrations.id')
      .join('organizations', 'schooling-registrations.organizationId', 'organizations.id')
      .where({ userId, type: 'SCO', 'schooling-registrations.id': schoolingRegistrationId })
      .first();

    return Boolean(exist);
  },

  async findByUserIdAndSCOOrganization({ userId }) {
    const schoolingRegistrations = await BookshelfSchoolingRegistration
      .query((qb) => qb.join('organizations', 'schooling-registrations.organizationId', 'organizations.id'))
      .where({ userId, type: 'SCO' })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  async addOrUpdateOrganizationAgriSchoolingRegistrations(schoolingRegistrationDatas, organizationId) {
    const schoolingRegistrationsFromFile = schoolingRegistrationDatas.map((schoolingRegistrationData) => new SchoolingRegistration({
      ...schoolingRegistrationData,
      organizationId,
    }));
    const currentSchoolingRegistrations = await this.findByOrganizationId({ organizationId });

    const [schoolingRegistrationStudent, schoolingRegistrationApprentice] = _.partition(schoolingRegistrationsFromFile, (schoolingRegistration) => {
      return schoolingRegistration.status === STATUS.STUDENT;
    });

    const [schoolingRegistrationsStudentToUpdate, schoolingRegistrationsStudentToCreate] = await this._getStudentsListToUpdateOrCreate(schoolingRegistrationStudent, currentSchoolingRegistrations);
    const [schoolingRegistrationsApprenticeToUpdate, schoolingRegistrationsApprenticeToCreate] = this._getApprenticesListToUpdateOrCreate(schoolingRegistrationApprentice, currentSchoolingRegistrations);

    const schoolingRegistrationsToUpdate = _.concat(schoolingRegistrationsStudentToUpdate, schoolingRegistrationsApprenticeToUpdate);
    const schoolingRegistrationsToCreate = _.concat(schoolingRegistrationsStudentToCreate, schoolingRegistrationsApprenticeToCreate);

    const trx = await Bookshelf.knex.transaction();
    try {
      await Promise.all([
        bluebird.mapSeries(schoolingRegistrationsToUpdate, async (schoolingRegistrationToUpdate) => {
          const attributesToUpdate = _.omit(schoolingRegistrationToUpdate, ['id', 'createdAt']);
          const whereConditions = {
            'organizationId': organizationId,
          };

          if (schoolingRegistrationToUpdate.status === STATUS.STUDENT) {
            whereConditions['nationalStudentId'] = schoolingRegistrationToUpdate.nationalStudentId;
          } else if (schoolingRegistrationToUpdate.status === STATUS.APPRENTICE) {
            whereConditions['nationalApprenticeId'] = schoolingRegistrationToUpdate.nationalApprenticeId;
          }

          await trx('schooling-registrations')
            .where(whereConditions)
            .update({ ...attributesToUpdate, updatedAt: Bookshelf.knex.raw('CURRENT_TIMESTAMP') });
        }),
        trx.batchInsert('schooling-registrations', schoolingRegistrationsToCreate),
      ]);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        if (err.detail.includes('nationalApprenticeId')) {
          throw new SameNationalApprenticeIdInOrganizationError(err.detail);
        } else {
          throw new SameNationalStudentIdInOrganizationError(err.detail);
        }
      }
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async addOrUpdateOrganizationSchoolingRegistrations(schoolingRegistrationDatas, organizationId) {
    const schoolingRegistrationsFromFile = schoolingRegistrationDatas.map((schoolingRegistrationData) => new SchoolingRegistration({
      ...schoolingRegistrationData,
      organizationId,
    }));
    const currentSchoolingRegistrations = await this.findByOrganizationId({ organizationId });

    const [schoolingRegistrationsToUpdate, schoolingRegistrationsToCreate] = await this._getStudentsListToUpdateOrCreate(schoolingRegistrationsFromFile, currentSchoolingRegistrations);

    const trx = await Bookshelf.knex.transaction();
    try {
      await Promise.all([
        bluebird.mapSeries(schoolingRegistrationsToUpdate, async (schoolingRegistrationToUpdate) => {
          const attributesToUpdate = _.omit(schoolingRegistrationToUpdate, ['id', 'createdAt']);
          const whereConditions = {
            'organizationId': organizationId,
            'nationalStudentId': schoolingRegistrationToUpdate.nationalStudentId,
          };

          await trx('schooling-registrations')
            .where(whereConditions)
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

  _getApprenticesListToUpdateOrCreate(schoolingRegistrationApprentice, currentSchoolingRegistrations) {
    return _.partition(schoolingRegistrationApprentice, (schoolingRegistration) => {

      const currentSchoolingRegistration = currentSchoolingRegistrations.find((currentSchoolingRegistration) => {
        return currentSchoolingRegistration.nationalApprenticeId === schoolingRegistration.nationalApprenticeId;
      });

      return !!currentSchoolingRegistration;
    });
  },

  async _getStudentsListToUpdateOrCreate(schoolingRegistrationStudent, currentSchoolingRegistrations) {
    const nationalStudentIdsFromFile = schoolingRegistrationStudent.map((schoolingRegistrationData) => schoolingRegistrationData.nationalStudentId);
    const students = await studentRepository.findReconciledStudentsByNationalStudentId(_.compact(nationalStudentIdsFromFile));

    return _.partition(schoolingRegistrationStudent, (schoolingRegistration) => {

      const currentSchoolingRegistration = currentSchoolingRegistrations.find((currentSchoolingRegistration) => {
        return currentSchoolingRegistration.nationalStudentId === schoolingRegistration.nationalStudentId;
      });

      if (!currentSchoolingRegistration || !_isReconciled(currentSchoolingRegistration)) {
        const student = students.find((student) => student.nationalStudentId === schoolingRegistration.nationalStudentId);
        if (student) {
          schoolingRegistration.userId = student.account.userId;
        }
      }

      return !!currentSchoolingRegistration;
    });
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
    const { models, pagination } = await BookshelfSchoolingRegistration
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
          'authentication-methods.externalIdentifier as samlId',
        );
        qb.orderByRaw('LOWER("schooling-registrations"."lastName") ASC, LOWER("schooling-registrations"."firstName") ASC');
        qb.leftJoin('users', 'schooling-registrations.userId', 'users.id');
        qb.leftJoin('authentication-methods', function() {
          this.on('users.id', 'authentication-methods.userId').andOnVal('authentication-methods.identityProvider', AuthenticationMethod.identityProviders.GAR);
        });
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

  updateUserIdWhereNull({
    schoolingRegistrationId,
    userId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    return BookshelfSchoolingRegistration
      .where({ id: schoolingRegistrationId, userId: null })
      .save(
        { userId },
        {
          transacting: domainTransaction.knexTransaction,
          patch: true,
          method: 'update',
        },
      )
      .then((schoolingRegistration) => bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration))
      .catch((err) => {
        if (err instanceof BookshelfSchoolingRegistration.NoRowsUpdatedError) {
          throw new SchoolingRegistrationNotFound(`SchoolingRegistration not found for ID ${schoolingRegistrationId} and user ID null.`);
        }
        throw err;
      });
  },

};
