const _ = require('lodash');

const {
  NotFoundError,
  OrganizationLearnerNotFound,
  OrganizationLearnersCouldNotBeSavedError,
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
const { fetchPage } = require('../utils/knex-utils');

function _setOrganizationLearnerFilters(
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

function _canReconcile(existingOrganizationLearners, student) {
  const existingRegistrationForUserId = existingOrganizationLearners.find((currentOrganizationLearner) => {
    return currentOrganizationLearner.userId === student.account.userId;
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

  async isOrganizationLearnerIdLinkedToUserAndSCOOrganization({ userId, organizationLearnerId }) {
    const exist = await Bookshelf.knex('organization-learners')
      .select('organization-learners.id')
      .join('organizations', 'organization-learners.organizationId', 'organizations.id')
      .where({ userId, type: 'SCO', 'organization-learners.id': organizationLearnerId })
      .first();

    return Boolean(exist);
  },

  async disableAllOrganizationLearnersInOrganization({ domainTransaction, organizationId }) {
    const knexConn = domainTransaction.knexTransaction;
    await knexConn('organization-learners')
      .where({ organizationId, isDisabled: false })
      .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
  },

  async addOrUpdateOrganizationOfOrganizationLearners(organizationLearnerDatas, organizationId, domainTransaction) {
    const knexConn = domainTransaction.knexTransaction;
    const organizationLearnersFromFile = organizationLearnerDatas.map(
      (organizationLearnerData) =>
        new OrganizationLearner({
          ...organizationLearnerData,
          organizationId,
        })
    );
    const existingOrganizationLearners = await this.findByOrganizationId({ organizationId }, domainTransaction);

    const reconciledOrganizationLearnersToImport = await this._reconcileOrganizationLearners(
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
      throw new OrganizationLearnersCouldNotBeSavedError();
    }
  },

  async _reconcileOrganizationLearners(organizationLearnersToImport, existingOrganizationLearners, domainTransaction) {
    const nationalStudentIdsFromFile = organizationLearnersToImport.map(
      (organizationLearnerData) => organizationLearnerData.nationalStudentId
    );
    const students = await studentRepository.findReconciledStudentsByNationalStudentId(
      _.compact(nationalStudentIdsFromFile),
      domainTransaction
    );

    _.each(students, (student) => {
      const alreadyReconciledOrganizationLearner = _.find(organizationLearnersToImport, {
        userId: student.account.userId,
      });

      if (alreadyReconciledOrganizationLearner) {
        alreadyReconciledOrganizationLearner.userId = null;
      } else if (_canReconcile(existingOrganizationLearners, student)) {
        const organizationLearner = _.find(organizationLearnersToImport, {
          nationalStudentId: student.nationalStudentId,
        });
        organizationLearner.userId = student.account.userId;
      }
    });
    return organizationLearnersToImport;
  },

  async findByOrganizationIdAndBirthdate({ organizationId, birthdate }) {
    const organizationLearners = await BookshelfOrganizationLearner.query((qb) => {
      qb.where('organizationId', organizationId);
      qb.where('birthdate', birthdate);
      qb.where('isDisabled', false);
    }).fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganizationLearner, organizationLearners);
  },

  async reconcileUserToOrganizationLearner({ userId, organizationLearnerId }) {
    try {
      const organizationLearner = await BookshelfOrganizationLearner.where({ id: organizationLearnerId })
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

  async getOrganizationLearnerForAdmin(organizationLearnerId) {
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
      throw new NotFoundError(`Organization Learner not found for ID ${organizationLearnerId}`);
    }
    return new OrganizationLearnerForAdmin(organizationLearner);
  },

  async dissociateUserFromOrganizationLearner(organizationLearnerId) {
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

  async getLatestOrganizationLearner({ nationalStudentId, birthdate }) {
    const organizationLearner = await knex
      .where({ nationalStudentId, birthdate })
      .whereNotNull('userId')
      .select()
      .from('organization-learners')
      .orderBy('updatedAt', 'desc')
      .first();

    if (!organizationLearner) {
      throw new UserNotFoundError();
    }

    return organizationLearner;
  },

  async findPaginatedFilteredOrganizationLearners({ organizationId, filter, page = {} }) {
    const query = knex
      .distinct('organization-learners.id')
      .select([
        'organization-learners.id',
        'organization-learners.firstName',
        'organization-learners.lastName',
        knex.raw('LOWER("organization-learners"."firstName") AS "lowerFirstName"'),
        knex.raw('LOWER("organization-learners"."lastName") AS "lowerLastName"'),
        'organization-learners.birthdate',
        'organization-learners.division',
        'organization-learners.group',
        'organization-learners.studentNumber',
        'organization-learners.userId',
        'organization-learners.organizationId',
        'users.username',
        'users.email',
        'authentication-methods.externalIdentifier as samlId',
        knex.raw(
          'FIRST_VALUE("name") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
        ),
        knex.raw(
          'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
        ),
        knex.raw(
          'FIRST_VALUE("type") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "organizationLearnerId") AS "participationCount"'
        ),
        knex.raw(
          'max("campaign-participations"."createdAt") OVER(PARTITION BY "organizationLearnerId") AS "lastParticipationDate"'
        ),
      ])
      .from('organization-learners')
      .leftJoin('campaign-participations', 'campaign-participations.organizationLearnerId', 'organization-learners.id')
      .leftJoin('users', 'users.id', 'organization-learners.userId')
      .leftJoin('authentication-methods', function () {
        this.on('users.id', 'authentication-methods.userId').andOnVal(
          'authentication-methods.identityProvider',
          AuthenticationMethod.identityProviders.GAR
        );
      })
      .leftJoin('campaigns', function () {
        this.on('campaigns.id', 'campaign-participations.campaignId').andOn(
          'campaigns.organizationId',
          'organization-learners.organizationId'
        );
      })
      .where(function (qb) {
        qb.where({ 'campaign-participations.id': null });
        qb.orWhere({
          'campaign-participations.isImproved': false,
          'campaign-participations.deletedAt': null,
        });
      })
      .where('organization-learners.isDisabled', false)
      .where('organization-learners.organizationId', organizationId)
      .modify(_setOrganizationLearnerFilters, filter)
      .orderByRaw('?? ASC, ?? ASC', ['lowerLastName', 'lowerFirstName']);

    const { results, pagination } = await fetchPage(query, page);

    const organizationLearners = results.map((result) => {
      return new UserWithOrganizationLearner({
        ...result,
        isAuthenticatedFromGAR: !!result.samlId,
      });
    });
    return {
      data: organizationLearners,
      pagination,
    };
  },

  updateUserIdWhereNull({ organizationLearnerId, userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    return BookshelfOrganizationLearner.where({ id: organizationLearnerId, userId: null })
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
          throw new OrganizationLearnerNotFound(
            `OrganizationLearner not found for ID ${organizationLearnerId} and user ID null.`
          );
        }
        throw err;
      });
  },

  async isActive({ userId, campaignId }) {
    const learner = await knex('organization-learners')
      .select('organization-learners.isDisabled')
      .join('organizations', 'organizations.id', 'organization-learners.organizationId')
      .join('campaigns', 'campaigns.organizationId', 'organizations.id')
      .where({ 'campaigns.id': campaignId })
      .andWhere({ 'organization-learners.userId': userId })
      .first();
    return !learner?.isDisabled;
  },
};
