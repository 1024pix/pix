const _ = require('lodash');

const {
  NotFoundError,
  SchoolingRegistrationNotFound,
  SchoolingRegistrationsCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
  UserNotFoundError,
} = require('../../domain/errors');

const UserWithOrganizationLearner = require('../../domain/models/UserWithOrganizationLearner');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const OrganizationLearner = require('../../domain/models/OrganizationLearner');
const OrganizationLearnerForAdmin = require('../../domain/read-models/OrganizationLearnerForAdmin');
const studentRepository = require('./student-repository');

const Bookshelf = require('../bookshelf');
const { knex } = require('../../../db/knex-database-connection');
const BookshelfOrganizationLearner = require('../orm-models/OrganizationLearner');

const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');

function _toUserWithOrganizationLearnerDTO(BookshelfOrganizationLearner) {
  const rawUserWithOrganizationLearner = BookshelfOrganizationLearner.toJSON();

  return new UserWithOrganizationLearner({
    ...rawUserWithOrganizationLearner,
    isAuthenticatedFromGAR: !!rawUserWithOrganizationLearner.samlId,
  });
}

function _setSchoolingRegistrationFilters(
  qb,
  { lastName, firstName, studentNumber, divisions, groups, connexionType } = {}
) {
  if (lastName) {
    qb.whereRaw('LOWER("organization-learners"."lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (firstName) {
    qb.whereRaw('LOWER("organization-learners"."firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (studentNumber) {
    qb.whereRaw('LOWER("organization-learners"."studentNumber") LIKE ?', `%${studentNumber.toLowerCase()}%`);
  }
  if (!_.isEmpty(divisions)) {
    qb.whereIn('division', divisions);
  }
  if (groups) {
    qb.whereIn(
      knex.raw('LOWER("organization-learners"."group")'),
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
    const organizationLearners = BookshelfOrganizationLearner.where('id', 'in', ids).fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationLearner, organizationLearners);
  },

  findByOrganizationId({ organizationId }, transaction = DomainTransaction.emptyTransaction()) {
    const knexConn = transaction.knexTransaction || knex;
    return knexConn('organization-learners')
      .where({ organizationId })
      .orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC')
      .then((organizationLearners) =>
        organizationLearners.map((organizationLearner) => new OrganizationLearner(organizationLearner))
      );
  },

  async findByOrganizationIdAndUpdatedAtOrderByDivision({ organizationId, page, filter }) {
    const BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-08-15';
    const query = BookshelfOrganizationLearner.where((qb) => {
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
      data: bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationLearner, models),
      pagination,
    };
  },

  async findByUserId({ userId }) {
    const organizationLearners = await BookshelfOrganizationLearner.where({ userId }).orderBy('id').fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationLearner, organizationLearners);
  },

  async isSchoolingRegistrationIdLinkedToUserAndSCOOrganization({ userId, schoolingRegistrationId }) {
    const exist = await Bookshelf.knex('organization-learners')
      .select('organization-learners.id')
      .join('organizations', 'organization-learners.organizationId', 'organizations.id')
      .where({ userId, type: 'SCO', 'organization-learners.id': schoolingRegistrationId })
      .first();

    return Boolean(exist);
  },

  async disableAllSchoolingRegistrationsInOrganization({ domainTransaction, organizationId }) {
    const knexConn = domainTransaction.knexTransaction;
    await knexConn('organization-learners')
      .where({ organizationId, isDisabled: false })
      .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
  },

  async addOrUpdateOrganizationSchoolingRegistrations(organizationLearnerDatas, organizationId, domainTransaction) {
    const knexConn = domainTransaction.knexTransaction;
    const organizationLearnersFromFile = organizationLearnerDatas.map(
      (organizationLearnerData) =>
        new OrganizationLearner({
          ...organizationLearnerData,
          organizationId,
        })
    );
    const existingOrganizationLearners = await this.findByOrganizationId({ organizationId }, domainTransaction);

    const reconciledOrganizationLearnersToImport = await this._reconcileSchoolingRegistrations(
      organizationLearnersFromFile,
      existingOrganizationLearners,
      domainTransaction
    );

    try {
      const organizationLearnersToSave = reconciledOrganizationLearnersToImport.map((organizationLearner) => ({
        ..._.omit(organizationLearner, ['id', 'createdAt']),
        updatedAt: knexConn.raw('CURRENT_TIMESTAMP'),
        isDisabled: false,
      }));

      await knexConn('organization-learners')
        .insert(organizationLearnersToSave)
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
    const organizationLearners = await BookshelfOrganizationLearner.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.where('birthdate', birthdate);
      qb.where('isDisabled', false);
    }).fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationLearner, organizationLearners);
  },

  async reconcileUserToSchoolingRegistration({ userId, schoolingRegistrationId }) {
    try {
      const organizationLearner = await BookshelfOrganizationLearner.where({ id: schoolingRegistrationId })
        .where('isDisabled', false)
        .save(
          { userId },
          {
            patch: true,
          }
        );
      return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationLearner, organizationLearner);
    } catch (error) {
      throw new UserCouldNotBeReconciledError();
    }
  },

  async reconcileUserByNationalStudentIdAndOrganizationId({ nationalStudentId, userId, organizationId }) {
    try {
      const organizationLearner = await BookshelfOrganizationLearner.where({
        organizationId,
        nationalStudentId,
        isDisabled: false,
      }).save({ userId }, { patch: true });
      return bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationLearner, organizationLearner);
    } catch (error) {
      throw new UserCouldNotBeReconciledError();
    }
  },

  async getSchoolingRegistrationForAdmin(organizationLearnerId) {
    const organizationLearner = await knex('organization-learners')
      .select(
        'organization-learners.id as id',
        'firstName',
        'lastName',
        'birthdate',
        'division',
        'group',
        'organizationId',
        'organizations.name as organizationName',
        'organization-learners.createdAt as createdAt',
        'organization-learners.updatedAt as updatedAt',
        'isDisabled',
        'organizations.isManagingStudents as organizationIsManagingStudents'
      )
      .innerJoin('organizations', 'organizations.id', 'organization-learners.organizationId')
      .where({ 'organization-learners.id': organizationLearnerId })
      .first();

    if (!organizationLearner) {
      throw new NotFoundError(`Schooling registration not found for ID ${organizationLearnerId}`);
    }
    return new OrganizationLearnerForAdmin(organizationLearner);
  },

  async dissociateUserFromSchoolingRegistration(organizationLearnerId) {
    await BookshelfOrganizationLearner.where({ id: organizationLearnerId }).save(
      { userId: null },
      {
        patch: true,
      }
    );
  },

  async findOneByUserIdAndOrganizationId({
    userId,
    organizationId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const organizationLearner = await knex('organization-learners')
      .transacting(domainTransaction)
      .first('*')
      .where({ userId, organizationId });
    if (!organizationLearner) return null;
    return new OrganizationLearner(organizationLearner);
  },

  get(organizationLearnerId) {
    return BookshelfOrganizationLearner.where({ id: organizationLearnerId })
      .fetch()
      .then((organizationLearner) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationLearner, organizationLearner)
      )
      .catch((err) => {
        if (err instanceof BookshelfOrganizationLearner.NotFoundError) {
          throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
        }
        throw err;
      });
  },

  async getLatestSchoolingRegistration({ nationalStudentId, birthdate }) {
    const schoolingRegistration = await knex
      .where({ nationalStudentId, birthdate })
      .whereNotNull('userId')
      .select()
      .from('organization-learners')
      .orderBy('updatedAt', 'desc')
      .first();

    if (!schoolingRegistration) {
      throw new UserNotFoundError();
    }

    return schoolingRegistration;
  },

  async findPaginatedFilteredSchoolingRegistrations({ organizationId, filter, page = {} }) {
    const { models, pagination } = await BookshelfOrganizationLearner.where({ organizationId })
      .query((qb) => {
        qb.select(
          'organization-learners.id',
          'organization-learners.firstName',
          'organization-learners.lastName',
          'organization-learners.birthdate',
          'organization-learners.division',
          'organization-learners.group',
          'organization-learners.studentNumber',
          'organization-learners.userId',
          'organization-learners.organizationId',
          'users.username',
          'users.email',
          'authentication-methods.externalIdentifier as samlId'
        );
        qb.orderByRaw('LOWER("organization-learners"."lastName") ASC, LOWER("organization-learners"."firstName") ASC');
        qb.leftJoin('users', 'organization-learners.userId', 'users.id');
        qb.leftJoin('authentication-methods', function () {
          this.on('users.id', 'authentication-methods.userId').andOnVal(
            'authentication-methods.identityProvider',
            AuthenticationMethod.identityProviders.GAR
          );
        });
        qb.where('organization-learners.isDisabled', false);
        qb.modify(_setSchoolingRegistrationFilters, filter);
      })
      .fetchPage({
        page: page.number,
        pageSize: page.size,
        withRelated: ['user'],
      });

    return {
      data: models.map(_toUserWithOrganizationLearnerDTO),
      pagination,
    };
  },

  updateUserIdWhereNull({ schoolingRegistrationId, userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    return BookshelfOrganizationLearner.where({ id: schoolingRegistrationId, userId: null })
      .save(
        { userId },
        {
          transacting: domainTransaction.knexTransaction,
          patch: true,
          method: 'update',
        }
      )
      .then((organizationLearner) =>
        bookshelfToDomainConverter.buildDomainObject(BookshelfOrganizationLearner, organizationLearner)
      )
      .catch((err) => {
        if (err instanceof BookshelfOrganizationLearner.NoRowsUpdatedError) {
          throw new SchoolingRegistrationNotFound(
            `SchoolingRegistration not found for ID ${schoolingRegistrationId} and user ID null.`
          );
        }
        throw err;
      });
  },

  async isActive({ userId, campaignId }) {
    const registration = await knex('organization-learners')
      .select('organization-learners.isDisabled')
      .join('organizations', 'organizations.id', 'organization-learners.organizationId')
      .join('campaigns', 'campaigns.organizationId', 'organizations.id')
      .where({ 'campaigns.id': campaignId })
      .andWhere({ 'organization-learners.userId': userId })
      .first();
    return !registration?.isDisabled;
  },
};
