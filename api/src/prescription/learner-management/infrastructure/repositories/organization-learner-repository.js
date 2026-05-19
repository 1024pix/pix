import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  NotFoundError,
  OrganizationLearnersCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
} from '../../../../shared/domain/errors.js';
import { batchUpdate } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { OrganizationLearnerCertificabilityNotUpdatedError } from '../../domain/errors.js';
import { CommonOrganizationLearner } from '../../domain/models/CommonOrganizationLearner.js';
import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';
import { OrganizationLearnerForAdmin } from '../../domain/read-models/OrganizationLearnerForAdmin.js';

const dissociateUserFromOrganizationLearner = async function (organizationLearnerId) {
  const knexConn = DomainTransaction.getConnection();

  await _queryBuilderDissociation(knexConn).where({ id: organizationLearnerId });
};

function _queryBuilderDissociation(knexConn) {
  return knexConn('organization-learners').update({
    userId: null,
    certifiableAt: null,
    isCertifiable: null,
    updatedAt: new Date(),
  });
}

const getOrganizationLearnerForAdmin = async function (organizationLearnerId) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearner = await knexConn('view-active-organization-learners')
    .select(
      'view-active-organization-learners.id as id',
      'firstName',
      'lastName',
      'birthdate',
      'division',
      'group',
      'organizationId',
      'organizations.name as organizationName',
      'view-active-organization-learners.createdAt as createdAt',
      'view-active-organization-learners.updatedAt as updatedAt',
      'isDisabled',
      'organizations.isManagingStudents as organizationIsManagingStudents',
    )
    .innerJoin('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .where({ 'view-active-organization-learners.id': organizationLearnerId })
    .first();

  if (!organizationLearner) {
    throw new NotFoundError(`Organization Learner not found for ID ${organizationLearnerId}`);
  }
  return new OrganizationLearnerForAdmin(organizationLearner);
};

const disableAllOrganizationLearnersInOrganization = async function ({ organizationId, nationalStudentIds }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('organization-learners')
    .where({ organizationId, isDisabled: false })
    .whereNotIn('nationalStudentId', nationalStudentIds)
    .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
};

const addOrUpdateOrganizationOfOrganizationLearners = async function (organizationLearners) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const organizationLearnersToSave = organizationLearners.map((organizationLearner) => ({
      ..._.omit(organizationLearner, ['id', 'createdAt', 'isCertifiable', 'certifiableAt']),
      updatedAt: knexConn.raw('CURRENT_TIMESTAMP'),
      isDisabled: false,
    }));

    await knexConn('organization-learners')
      .insert(organizationLearnersToSave)
      .onConflict(knexConn.raw('("organizationId","nationalStudentId") where "deletedAt" is NULL'))
      .merge();
  } catch {
    throw new OrganizationLearnersCouldNotBeSavedError();
  }
};

const saveCommonOrganizationLearners = async function (learners) {
  const knexConn = DomainTransaction.getConnection();
  const now = new Date();
  learners.forEach((learner) => {
    learner.updatedAt = now;
  });
  await knexConn('organization-learners')
    .insert(learners)
    .onConflict('id')
    .merge(['firstName', 'lastName', 'attributes', 'isDisabled', 'updatedAt']);
};

const disableCommonOrganizationLearnersFromOrganizationId = function ({
  organizationId,
  excludeOrganizationLearnerIds = [],
}) {
  const knex = DomainTransaction.getConnection();
  return knex('organization-learners')
    .where({ organizationId, isDisabled: false })
    .whereNull('deletedAt')
    .update({ isDisabled: true, updatedAt: new Date() })
    .whereNotIn('id', excludeOrganizationLearnerIds);
};

const findAllCommonLearnersFromOrganizationId = async function ({ organizationId }) {
  const knex = DomainTransaction.getConnection();

  const existingLearners = await knex('view-active-organization-learners')
    .select(['firstName', 'id', 'lastName', 'userId', 'organizationId', 'attributes'])
    .where({ organizationId });

  return existingLearners.map(
    ({ firstName, lastName, id, userId, organizationId, attributes }) =>
      new CommonOrganizationLearner({ firstName, lastName, id, userId, organizationId, ...attributes }),
  );
};

/**
 * @function
 * @name findAllCommonOrganizationLearnerByReconciliationInfos
 * @param {Object} params
 * @param {number} params.organizationId
 * @param {Object} params.reconciliationInformations
 * @returns {Promise<CommonOrganizationLearner[]>}
 */
const findAllCommonOrganizationLearnerByReconciliationInfos = async function ({
  organizationId,
  reconciliationInformations,
}) {
  const knex = DomainTransaction.getConnection();

  const query = knex('view-active-organization-learners')
    .select('firstName', 'lastName', 'id', 'attributes', 'userId')
    .where({ organizationId, isDisabled: false });

  if (reconciliationInformations) {
    query.whereJsonSupersetOf('attributes', reconciliationInformations);
  }

  const result = await query;

  return result.map(
    ({ firstName, lastName, id, userId, attributes }) =>
      new CommonOrganizationLearner({ id, firstName, lastName, organizationId, userId, ...attributes }),
  );
};

const update = async function (organizationLearner) {
  const knex = DomainTransaction.getConnection();

  const { id, ...attributes } = organizationLearner;
  const updatedRows = await knex('organization-learners').update(attributes).where({ id });
  return updatedRows === 1;
};

const reconcileUserByNationalStudentIdAndOrganizationId = async function ({
  nationalStudentId,
  userId,
  organizationId,
}) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const [rawOrganizationLearner] = await knexConn('organization-learners')
      .where({
        organizationId,
        nationalStudentId,
        isDisabled: false,
      })
      .whereNull('deletedAt')
      .whereNotNull('nationalStudentId')
      .update({ userId, updatedAt: knexConn.fn.now() })
      .returning('*');

    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch {
    throw new UserCouldNotBeReconciledError();
  }
};

const countByUserId = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const { count } = await knexConn('organization-learners').count('id').where({ userId }).first();

  return count;
};

const findByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const rawOrganizationLearners = await knexConn
    .select('*')
    .from('view-active-organization-learners')
    .where({ userId })
    .orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

const findOrganizationLearnersByOrganizationIdAndLearnerIds = async function ({
  organizationId,
  organizationLearnerIds = [],
  keepPreviousDeletion = false,
}) {
  if (organizationLearnerIds.length === 0) {
    return [];
  }
  const knexConnection = DomainTransaction.getConnection();
  const organizationLearners = await knexConnection(
    keepPreviousDeletion ? 'organization-learners' : 'view-active-organization-learners',
  )
    .whereIn('id', organizationLearnerIds)
    .where({ organizationId });
  return organizationLearners.map((organizationLearner) => _toDomain(organizationLearner));
};

const reconcileUserToOrganizationLearner = async function ({ userId, organizationLearnerId }) {
  try {
    const knexConn = DomainTransaction.getConnection();
    const [rawOrganizationLearner] = await knexConn('organization-learners')
      .where({ id: organizationLearnerId })
      .where('isDisabled', false)
      .update({ userId, updatedAt: knexConn.fn.now() })
      .returning('*');
    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch {
    throw new UserCouldNotBeReconciledError();
  }
};

async function updateCertificability(organizationLearner) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('organization-learners').where({ id: organizationLearner.id }).update({
    isCertifiable: organizationLearner.isCertifiable,
    certifiableAt: organizationLearner.certifiableAt,
  });
  if (result === 0) {
    throw new OrganizationLearnerCertificabilityNotUpdatedError(
      `Could not update certificability for OrganizationLearner with ID ${organizationLearner.id}.`,
    );
  }
}

async function getLearnerInfo(organizationLearnerId) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearner = await knexConn
    .select('*')
    .from('view-active-organization-learners')
    .where({ id: organizationLearnerId })
    .first();

  if (!organizationLearner) {
    throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
  }
  return new OrganizationLearner(organizationLearner);
}

const updateInBatchByIds = async (organizationLearners) => {
  return batchUpdate({ tableName: 'organization-learners', primaryKeyName: 'id', rows: organizationLearners });
};

function _toDomain(result) {
  return new OrganizationLearner(result);
}

/**
 * @function
 * @name findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId
 * @param {Object} params
 * @param {number} params.organizationId
 * @returns {Promise<number[]>}
 */
const findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId = async function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('view-active-organization-learners').where({ organizationId }).whereNull('attributes').pluck('id');
};
export {
  addOrUpdateOrganizationOfOrganizationLearners,
  countByUserId,
  disableAllOrganizationLearnersInOrganization,
  disableCommonOrganizationLearnersFromOrganizationId,
  dissociateUserFromOrganizationLearner,
  findAllCommonLearnersFromOrganizationId,
  findAllCommonOrganizationLearnerByReconciliationInfos,
  findByUserId,
  findOrganizationLearnerIdsBeforeImportFeatureFromOrganizationId,
  findOrganizationLearnersByOrganizationIdAndLearnerIds,
  getLearnerInfo,
  getOrganizationLearnerForAdmin,
  reconcileUserByNationalStudentIdAndOrganizationId,
  reconcileUserToOrganizationLearner,
  saveCommonOrganizationLearners,
  update,
  updateCertificability,
  updateInBatchByIds,
};
