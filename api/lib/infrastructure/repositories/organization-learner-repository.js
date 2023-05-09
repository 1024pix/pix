import _ from 'lodash';

import {
  NotFoundError,
  OrganizationLearnerNotFound,
  OrganizationLearnersCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
  UserNotFoundError,
} from '../../domain/errors.js';

import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';
import { OrganizationLearnerForAdmin } from '../../domain/read-models/OrganizationLearnerForAdmin.js';
import * as studentRepository from './student-repository.js';

import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { DomainTransaction } from '../DomainTransaction.js';

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

const findByIds = async function ({ ids }) {
  const rawOrganizationLearners = await knex.select('*').from('organization-learners').whereIn('id', ids).orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

const findByOrganizationId = function ({ organizationId }, transaction = DomainTransaction.emptyTransaction()) {
  const knexConn = transaction.knexTransaction || knex;
  return knexConn('organization-learners')
    .where({ organizationId })
    .orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC')
    .then((organizationLearners) =>
      organizationLearners.map((organizationLearner) => new OrganizationLearner(organizationLearner))
    );
};

const findByOrganizationIdAndUpdatedAtOrderByDivision = async function ({ organizationId, page, filter }) {
  const BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-08-15';
  const query = knex('organization-learners')
    .where({
      organizationId,
      isDisabled: false,
    })
    .where('updatedAt', '>', BEGINNING_OF_THE_2020_SCHOOL_YEAR)
    .orderByRaw('LOWER("division") ASC, LOWER("lastName") ASC, LOWER("firstName") ASC');

  if (filter.divisions) {
    query.whereIn('division', filter.divisions);
  }

  const { results, pagination } = await fetchPage(query, page);

  return {
    data: results.map((result) => new OrganizationLearner(result)),
    pagination,
  };
};

const findByUserId = async function ({ userId }) {
  const rawOrganizationLearners = await knex.select('*').from('organization-learners').where({ userId }).orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

const isOrganizationLearnerIdLinkedToUserAndSCOOrganization = async function ({ userId, organizationLearnerId }) {
  const exist = await knex('organization-learners')
    .select('organization-learners.id')
    .join('organizations', 'organization-learners.organizationId', 'organizations.id')
    .where({ userId, type: 'SCO', 'organization-learners.id': organizationLearnerId })
    .first();

  return Boolean(exist);
};

const disableAllOrganizationLearnersInOrganization = async function ({ domainTransaction, organizationId }) {
  const knexConn = domainTransaction.knexTransaction;
  await knexConn('organization-learners')
    .where({ organizationId, isDisabled: false })
    .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
};

const addOrUpdateOrganizationOfOrganizationLearners = async function (
  organizationLearnerDatas,
  organizationId,
  domainTransaction
) {
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
};

const _reconcileOrganizationLearners = async function (
  studentsToImport,
  allOrganizationLearnersInSameOrganization,
  domainTransaction
) {
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
};

const findByOrganizationIdAndBirthdate = async function ({ organizationId, birthdate }) {
  const rawOrganizationLearners = await knex
    .select('*')
    .from('organization-learners')
    .where({ organizationId, birthdate, isDisabled: false })
    .orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

const reconcileUserToOrganizationLearner = async function ({ userId, organizationLearnerId }) {
  try {
    const [rawOrganizationLearner] = await knex('organization-learners')
      .where({ id: organizationLearnerId })
      .where('isDisabled', false)
      .update({ userId, updatedAt: knex.fn.now() })
      .returning('*');
    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch (error) {
    throw new UserCouldNotBeReconciledError();
  }
};

const reconcileUserByNationalStudentIdAndOrganizationId = async function ({
  nationalStudentId,
  userId,
  organizationId,
}) {
  try {
    const [rawOrganizationLearner] = await knex('organization-learners')
      .where({
        organizationId,
        nationalStudentId,
        isDisabled: false,
      })
      .update({ userId, updatedAt: knex.fn.now() })
      .returning('*');
    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch (error) {
    throw new UserCouldNotBeReconciledError();
  }
};

const getOrganizationLearnerForAdmin = async function (organizationLearnerId) {
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
};

const dissociateUserFromOrganizationLearner = async function (organizationLearnerId) {
  await knex('organization-learners').where({ id: organizationLearnerId }).update({ userId: null });
};

const dissociateAllStudentsByUserId = async function ({
  userId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  await knexConn('organization-learners')
    .update({ userId: null, updatedAt: knex.fn.now() })
    .where({ userId })
    .whereIn(
      'organization-learners.organizationId',
      knex.select('id').from('organizations').where({ isManagingStudents: true })
    );
};

const findOneByUserIdAndOrganizationId = async function ({
  userId,
  organizationId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const organizationLearner = await knex('organization-learners')
    .transacting(domainTransaction)
    .where({ userId, organizationId })
    .first('*');
  if (!organizationLearner) return null;
  return new OrganizationLearner(organizationLearner);
};

const get = async function (organizationLearnerId) {
  const organizationLearner = await knex
    .select('*')
    .from('organization-learners')
    .where({ id: organizationLearnerId })
    .first();

  if (!organizationLearner) {
    throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
  }
  return new OrganizationLearner(organizationLearner);
};

const getLatestOrganizationLearner = async function ({ nationalStudentId, birthdate }) {
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
};

const updateUserIdWhereNull = async function ({
  organizationLearnerId,
  userId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const [rawOrganizationLearner] = await knexConn('organization-learners')
    .where({ id: organizationLearnerId, userId: null })
    .update({ userId, updatedAt: knex.fn.now() })
    .returning('*');

  if (!rawOrganizationLearner)
    throw new OrganizationLearnerNotFound(
      `OrganizationLearner not found for ID ${organizationLearnerId} and user ID null.`
    );

  return new OrganizationLearner(rawOrganizationLearner);
};

const isActive = async function ({ userId, campaignId }) {
  const learner = await knex('organization-learners')
    .select('organization-learners.isDisabled')
    .join('organizations', 'organizations.id', 'organization-learners.organizationId')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where({ 'campaigns.id': campaignId })
    .andWhere({ 'organization-learners.userId': userId })
    .first();
  return !learner?.isDisabled;
};

export {
  findByIds,
  findByOrganizationId,
  findByOrganizationIdAndUpdatedAtOrderByDivision,
  findByUserId,
  isOrganizationLearnerIdLinkedToUserAndSCOOrganization,
  disableAllOrganizationLearnersInOrganization,
  addOrUpdateOrganizationOfOrganizationLearners,
  _reconcileOrganizationLearners,
  findByOrganizationIdAndBirthdate,
  reconcileUserToOrganizationLearner,
  reconcileUserByNationalStudentIdAndOrganizationId,
  getOrganizationLearnerForAdmin,
  dissociateUserFromOrganizationLearner,
  dissociateAllStudentsByUserId,
  findOneByUserIdAndOrganizationId,
  get,
  getLatestOrganizationLearner,
  updateUserIdWhereNull,
  isActive,
};
