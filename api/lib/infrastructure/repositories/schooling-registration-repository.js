const _ = require('lodash');

const {
  NotFoundError,
  SchoolingRegistrationNotFound,
  SchoolingRegistrationsCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
  UserNotFoundError,
} = require('../../domain/errors');

const UserWithSchoolingRegistration = require('../../domain/models/UserWithSchoolingRegistration');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const SchoolingRegistration = require('../../domain/models/SchoolingRegistration');
const SchoolingRegistrationForAdmin = require('../../domain/read-models/SchoolingRegistrationForAdmin');
const studentRepository = require('./student-repository');

const Bookshelf = require('../bookshelf');
const { knex } = require('../../../db/knex-database-connection');
const BookshelfSchoolingRegistration = require('../orm-models/SchoolingRegistration');

const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');

function _toUserWithSchoolingRegistrationDTO(BookshelfSchoolingRegistration) {
  const rawUserWithSchoolingRegistration = BookshelfSchoolingRegistration.toJSON();

  return new UserWithSchoolingRegistration({
    ...rawUserWithSchoolingRegistration,
    isAuthenticatedFromGAR: !!rawUserWithSchoolingRegistration.samlId,
  });
}

function _setSchoolingRegistrationFilters(
  qb,
  { lastName, firstName, studentNumber, divisions, groups, connexionType } = {}
) {
  if (lastName) {
    qb.whereRaw('LOWER("schooling-registrations"."lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (firstName) {
    qb.whereRaw('LOWER("schooling-registrations"."firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (studentNumber) {
    qb.whereRaw('LOWER("schooling-registrations"."studentNumber") LIKE ?', `%${studentNumber.toLowerCase()}%`);
  }
  if (!_.isEmpty(divisions)) {
    qb.whereIn('division', divisions);
  }
  if (groups) {
    qb.whereIn(
      knex.raw('LOWER("schooling-registrations"."group")'),
      groups.map((group) => group.toLowerCase())
    );
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

function _canReconcile(existingSchoolingRegistrations, student) {
  const existingRegistrationForUserId = existingSchoolingRegistrations.find((currentSchoolingRegistration) => {
    return currentSchoolingRegistration.userId === student.account.userId;
  });
  return (
    existingRegistrationForUserId == null ||
    existingRegistrationForUserId.nationalStudentId === student.nationalStudentId
  );
}

module.exports = {
  findByIds({ ids }) {
    const schoolingRegistrations = BookshelfSchoolingRegistration.where('id', 'in', ids).fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  findByOrganizationId({ organizationId }, transaction = DomainTransaction.emptyTransaction()) {
    const knexConn = transaction.knexTransaction || knex;
    return knexConn('schooling-registrations')
      .where({ organizationId })
      .orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC')
      .then((schoolingRegistrations) =>
        schoolingRegistrations.map((schoolingRegistration) => new SchoolingRegistration(schoolingRegistration))
      );
  },

  async findByOrganizationIdAndUpdatedAtOrderByDivision({ organizationId, page, filter }) {
    const BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-08-15';
    const query = BookshelfSchoolingRegistration.where((qb) => {
      qb.where({ organizationId });
      qb.where('updatedAt', '>', BEGINNING_OF_THE_2020_SCHOOL_YEAR);
      qb.where('isDisabled', false);
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
    const schoolingRegistrations = await BookshelfSchoolingRegistration.where({ userId }).orderBy('id').fetchAll();

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

  async disableAllSchoolingRegistrationsInOrganization({ domainTransaction, organizationId }) {
    const knexConn = domainTransaction.knexTransaction;
    await knexConn('schooling-registrations')
      .where({ organizationId, isDisabled: false })
      .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
  },

  async addOrUpdateOrganizationSchoolingRegistrations(schoolingRegistrationDatas, organizationId, domainTransaction) {
    const knexConn = domainTransaction.knexTransaction;
    const schoolingRegistrationsFromFile = schoolingRegistrationDatas.map(
      (schoolingRegistrationData) =>
        new SchoolingRegistration({
          ...schoolingRegistrationData,
          organizationId,
        })
    );
    const existingSchoolingRegistrations = await this.findByOrganizationId({ organizationId }, domainTransaction);

    const reconciledSchoolingRegistrationsToImport = await this._reconcileSchoolingRegistrations(
      schoolingRegistrationsFromFile,
      existingSchoolingRegistrations,
      domainTransaction
    );

    try {
      const schoolingRegistrationsToSave = reconciledSchoolingRegistrationsToImport.map((schoolingRegistration) => ({
        ..._.omit(schoolingRegistration, ['id', 'createdAt']),
        updatedAt: knexConn.raw('CURRENT_TIMESTAMP'),
        isDisabled: false,
      }));

      await knexConn('schooling-registrations')
        .insert(schoolingRegistrationsToSave)
        .onConflict(['organizationId', 'nationalStudentId'])
        .merge();
    } catch (err) {
      throw new SchoolingRegistrationsCouldNotBeSavedError();
    }
  },

  async _reconcileSchoolingRegistrations(
    schoolingRegistrationsToImport,
    existingSchoolingRegistrations,
    domainTransaction
  ) {
    const nationalStudentIdsFromFile = schoolingRegistrationsToImport.map(
      (schoolingRegistrationData) => schoolingRegistrationData.nationalStudentId
    );
    const students = await studentRepository.findReconciledStudentsByNationalStudentId(
      _.compact(nationalStudentIdsFromFile),
      domainTransaction
    );

    _.each(students, (student) => {
      const alreadyReconciledSchoolingRegistration = _.find(schoolingRegistrationsToImport, {
        userId: student.account.userId,
      });

      if (alreadyReconciledSchoolingRegistration) {
        alreadyReconciledSchoolingRegistration.userId = null;
      } else if (_canReconcile(existingSchoolingRegistrations, student)) {
        const schoolingRegistration = _.find(schoolingRegistrationsToImport, {
          nationalStudentId: student.nationalStudentId,
        });
        schoolingRegistration.userId = student.account.userId;
      }
    });
    return schoolingRegistrationsToImport;
  },

  async findByOrganizationIdAndBirthdate({ organizationId, birthdate }) {
    const schoolingRegistrations = await BookshelfSchoolingRegistration.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.where('birthdate', birthdate);
      qb.where('isDisabled', false);
    }).fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSchoolingRegistration, schoolingRegistrations);
  },

  async reconcileUserToSchoolingRegistration({ userId, schoolingRegistrationId }) {
    try {
      const schoolingRegistration = await BookshelfSchoolingRegistration.where({ id: schoolingRegistrationId })
        .where('isDisabled', false)
        .save(
          { userId },
          {
            patch: true,
          }
        );
      return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
    } catch (error) {
      throw new UserCouldNotBeReconciledError();
    }
  },

  async reconcileUserByNationalStudentIdAndOrganizationId({ nationalStudentId, userId, organizationId }) {
    try {
      const schoolingRegistration = await BookshelfSchoolingRegistration.where({
        organizationId,
        nationalStudentId,
        isDisabled: false,
      }).save({ userId }, { patch: true });
      return bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration);
    } catch (error) {
      throw new UserCouldNotBeReconciledError();
    }
  },

  async getSchoolingRegistrationForAdmin(schoolingRegistrationId) {
    const schoolingRegistration = await knex('schooling-registrations')
      .select(
        'schooling-registrations.id as id',
        'firstName',
        'lastName',
        'birthdate',
        'division',
        'group',
        'organizationId',
        'organizations.name as organizationName',
        'schooling-registrations.createdAt as createdAt',
        'schooling-registrations.updatedAt as updatedAt',
        'isDisabled',
        'organizations.isManagingStudents as organizationIsManagingStudents'
      )
      .innerJoin('organizations', 'organizations.id', 'schooling-registrations.organizationId')
      .where({ 'schooling-registrations.id': schoolingRegistrationId })
      .first();

    if (!schoolingRegistration) {
      throw new NotFoundError(`Schooling registration not found for ID ${schoolingRegistrationId}`);
    }
    return new SchoolingRegistrationForAdmin(schoolingRegistration);
  },

  async dissociateUserFromSchoolingRegistration(schoolingRegistrationId) {
    await BookshelfSchoolingRegistration.where({ id: schoolingRegistrationId }).save(
      { userId: null },
      {
        patch: true,
      }
    );
  },

  async dissociateUserFromSchoolingRegistrationIds(schoolingRegistrationIds) {
    await BookshelfSchoolingRegistration.where('id', 'in', schoolingRegistrationIds).save(
      { userId: null },
      { patch: true }
    );
  },

  async findOneByUserIdAndOrganizationId({
    userId,
    organizationId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const schoolingRegistration = await knex('schooling-registrations')
      .transacting(domainTransaction)
      .first('*')
      .where({ userId, organizationId });
    if (!schoolingRegistration) return null;
    return new SchoolingRegistration(schoolingRegistration);
  },

  async updateStudentNumber(studentId, studentNumber) {
    await BookshelfSchoolingRegistration.where('id', studentId).save(
      { studentNumber },
      {
        patch: true,
      }
    );
  },

  get(schoolingRegistrationId) {
    return BookshelfSchoolingRegistration.where({ id: schoolingRegistrationId })
      .fetch()
      .then((schoolingRegistration) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration)
      )
      .catch((err) => {
        if (err instanceof BookshelfSchoolingRegistration.NotFoundError) {
          throw new NotFoundError(`Student not found for ID ${schoolingRegistrationId}`);
        }
        throw err;
      });
  },

  async getLatestSchoolingRegistration({ nationalStudentId, birthdate }) {
    const schoolingRegistration = await knex
      .where({ nationalStudentId, birthdate })
      .whereNotNull('userId')
      .select()
      .from('schooling-registrations')
      .orderBy('updatedAt', 'desc')
      .first();

    if (!schoolingRegistration) {
      throw new UserNotFoundError();
    }

    return schoolingRegistration;
  },

  async findPaginatedFilteredSchoolingRegistrations({ organizationId, filter, page = {} }) {
    const { models, pagination } = await BookshelfSchoolingRegistration.where({ organizationId })
      .query((qb) => {
        qb.select(
          'schooling-registrations.id',
          'schooling-registrations.firstName',
          'schooling-registrations.lastName',
          'schooling-registrations.birthdate',
          'schooling-registrations.division',
          'schooling-registrations.group',
          'schooling-registrations.studentNumber',
          'schooling-registrations.userId',
          'schooling-registrations.organizationId',
          'users.username',
          'users.email',
          'authentication-methods.externalIdentifier as samlId'
        );
        qb.orderByRaw(
          'LOWER("schooling-registrations"."lastName") ASC, LOWER("schooling-registrations"."firstName") ASC'
        );
        qb.leftJoin('users', 'schooling-registrations.userId', 'users.id');
        qb.leftJoin('authentication-methods', function () {
          this.on('users.id', 'authentication-methods.userId').andOnVal(
            'authentication-methods.identityProvider',
            AuthenticationMethod.identityProviders.GAR
          );
        });
        qb.where('schooling-registrations.isDisabled', false);
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

  updateUserIdWhereNull({ schoolingRegistrationId, userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    return BookshelfSchoolingRegistration.where({ id: schoolingRegistrationId, userId: null })
      .save(
        { userId },
        {
          transacting: domainTransaction.knexTransaction,
          patch: true,
          method: 'update',
        }
      )
      .then((schoolingRegistration) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfSchoolingRegistration, schoolingRegistration)
      )
      .catch((err) => {
        if (err instanceof BookshelfSchoolingRegistration.NoRowsUpdatedError) {
          throw new SchoolingRegistrationNotFound(
            `SchoolingRegistration not found for ID ${schoolingRegistrationId} and user ID null.`
          );
        }
        throw err;
      });
  },

  async isActive({ userId, campaignId }) {
    const registration = await knex('schooling-registrations')
      .select('schooling-registrations.isDisabled')
      .join('organizations', 'organizations.id', 'schooling-registrations.organizationId')
      .join('campaigns', 'campaigns.organizationId', 'organizations.id')
      .where({ 'campaigns.id': campaignId })
      .andWhere({ 'schooling-registrations.userId': userId })
      .first();
    return !registration?.isDisabled;
  },
};
