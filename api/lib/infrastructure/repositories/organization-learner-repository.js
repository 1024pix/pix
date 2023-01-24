const _ = require('lodash');

const {
  NotFoundError,
  OrganizationLearnerNotFound,
  OrganizationLearnersCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
  UserNotFoundError,
} = require('../../domain/errors');

const OrganizationLearner = require('../../domain/models/OrganizationLearner');
const OrganizationLearnerForAdmin = require('../../domain/read-models/OrganizationLearnerForAdmin');
const studentRepository = require('./student-repository');

const { knex } = require('../../../db/knex-database-connection');
const BookshelfOrganizationLearner = require('../orm-models/OrganizationLearner');

const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');

function _shouldStudentToImportBeReconciled(
  allOrganizationLearnersInSameOrganization,
  organizationLearner,
  studentToImport
) {
  const organizationLearnerWithSameUserId = allOrganizationLearnersInSameOrganization.find(
    (organizationLearnerInSameOrganization) => {
      return organizationLearnerInSameOrganization.userId === organizationLearner.account.userId;
    }
  );
  const isOrganizationLearnerReconciled = organizationLearnerWithSameUserId != null;
  const organizationLearnerHasSameUserIdAndNationalStudentId =
    organizationLearnerWithSameUserId?.nationalStudentId === organizationLearner.nationalStudentId;

  if (isOrganizationLearnerReconciled && !organizationLearnerHasSameUserIdAndNationalStudentId) {
    return false;
  }

  const isFromSameOrganization = studentToImport.organizationId === organizationLearner.account.organizationId;
  const isFromDifferentOrganizationWithSameBirthday =
    !isFromSameOrganization && studentToImport.birthdate === organizationLearner.account.birthdate;
  return isFromSameOrganization || isFromDifferentOrganizationWithSameBirthday;
}

module.exports = {
  async findByIds({ ids }) {
    const rawOrganizationLearners = await knex.select('*').from('organization-learners').whereIn('id', ids);

    return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
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
    const exist = await knex('organization-learners')
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

  async _reconcileOrganizationLearners(studentsToImport, allOrganizationLearnersInSameOrganization, domainTransaction) {
    const nationalStudentIdsFromFile = studentsToImport
      .map((organizationLearnerData) => organizationLearnerData.nationalStudentId)
      .filter(Boolean);
    const organizationLearnersWithSameNationalStudentIdsAsImported =
      await studentRepository.findReconciledStudentsByNationalStudentId(nationalStudentIdsFromFile, domainTransaction);

    organizationLearnersWithSameNationalStudentIdsAsImported.forEach((organizationLearner) => {
      const alreadyReconciledStudentToImport = studentsToImport.find(
        (studentToImport) => studentToImport.userId === organizationLearner.account.userId
      );

      if (alreadyReconciledStudentToImport) {
        alreadyReconciledStudentToImport.userId = null;
        return;
      }

      const studentToImport = studentsToImport.find(
        (studentToImport) => studentToImport.nationalStudentId === organizationLearner.nationalStudentId
      );

      if (
        _shouldStudentToImportBeReconciled(
          allOrganizationLearnersInSameOrganization,
          organizationLearner,
          studentToImport
        )
      ) {
        studentToImport.userId = organizationLearner.account.userId;
      }
    });
    return studentsToImport;
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
    await knex('organization-learners').where({ id: organizationLearnerId }).update({ userId: null });
  },

  async dissociateAllStudentsByUserId({ userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction ?? knex;
    await knexConn('organization-learners')
      .update({ userId: null })
      .where({ userId })
      .whereIn(
        'organization-learners.organizationId',
        knex.select('id').from('organizations').where({ isManagingStudents: true })
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

  async get(organizationLearnerId) {
    const organizationLearner = await knex
      .select('*')
      .from('organization-learners')
      .where({ id: organizationLearnerId })
      .first();

    if (!organizationLearner) {
      throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
    }
    return new OrganizationLearner(organizationLearner);
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
