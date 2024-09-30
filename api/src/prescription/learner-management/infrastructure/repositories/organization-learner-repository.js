import _ from 'lodash';

import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  NotFoundError,
  OrganizationLearnersCouldNotBeSavedError,
  UserCouldNotBeReconciledError,
} from '../../../../shared/domain/errors.js';
import { OrganizationLearner } from '../../../../shared/domain/models/index.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
import { CommonOrganizationLearner } from '../../domain/models/CommonOrganizationLearner.js';
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

const removeByIds = function ({ organizationLearnerIds, userId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('organization-learners')
    .whereIn('id', organizationLearnerIds)
    .whereNull('deletedAt')
    .update({ deletedAt: new Date(), deletedBy: userId });
};

const disableAllOrganizationLearnersInOrganization = async function ({ organizationId, nationalStudentIds }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('organization-learners')
    .where({ organizationId, isDisabled: false })
    .whereNotIn('nationalStudentId', nationalStudentIds)
    .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
};

const addOrUpdateOrganizationOfOrganizationLearners = async function (organizationLearnerDatas, organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const organizationLearnersFromFile = organizationLearnerDatas.map(
    (organizationLearnerData) =>
      new OrganizationLearner({
        ...organizationLearnerData,
        organizationId,
      }),
  );
  const existingOrganizationLearners = await organizationLearnerRepository.findByOrganizationId({ organizationId });

  const reconciledOrganizationLearnersToImport = await organizationLearnerRepository._reconcileOrganizationLearners(
    organizationLearnersFromFile,
    existingOrganizationLearners,
  );

  try {
    const organizationLearnersToSave = reconciledOrganizationLearnersToImport.map((organizationLearner) => ({
      ..._.omit(organizationLearner, ['id', 'createdAt', 'isCertifiable', 'certifiableAt']),
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

const saveCommonOrganizationLearners = function (learners) {
  const knex = ApplicationTransaction.getConnection();

  return Promise.all(
    learners.map((learner) => {
      return knex('organization-learners').insert(learner).onConflict('id').merge({
        firstName: learner.firstName,
        lastName: learner.lastName,
        attributes: learner.attributes,
        isDisabled: false,
        updatedAt: new Date(),
      });
    }),
  );
};

const disableCommonOrganizationLearnersFromOrganizationId = function ({
  organizationId,
  excludeOrganizationLearnerIds = [],
}) {
  const knex = ApplicationTransaction.getConnection();
  return knex('organization-learners')
    .where({ organizationId, isDisabled: false })
    .whereNull('deletedAt')
    .update({ isDisabled: true, updatedAt: new Date() })
    .whereNotIn('id', excludeOrganizationLearnerIds);
};

const findAllCommonLearnersFromOrganizationId = async function ({ organizationId }) {
  const knex = ApplicationTransaction.getConnection();

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
  const knex = ApplicationTransaction.getConnection();

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
  const knex = ApplicationTransaction.getConnection();

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
      .update({ userId, updatedAt: knexConn.fn.now() })
      .returning('*');

    if (!rawOrganizationLearner) throw new Error();
    return new OrganizationLearner(rawOrganizationLearner);
  } catch (error) {
    throw new UserCouldNotBeReconciledError();
  }
};

// copied from api/lib/repositories/organization-learner-repository-test.js-
const findByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const rawOrganizationLearners = await knexConn
    .select('*')
    .from('view-active-organization-learners')
    .where({ userId })
    .orderBy('id');

  return rawOrganizationLearners.map((rawOrganizationLearner) => new OrganizationLearner(rawOrganizationLearner));
};

export {
  addOrUpdateOrganizationOfOrganizationLearners,
  disableAllOrganizationLearnersInOrganization,
  disableCommonOrganizationLearnersFromOrganizationId,
  dissociateUserFromOrganizationLearner,
  findAllCommonLearnersFromOrganizationId,
  findAllCommonOrganizationLearnerByReconciliationInfos,
  findByUserId,
  getOrganizationLearnerForAdmin,
  reconcileUserByNationalStudentIdAndOrganizationId,
  removeByIds,
  saveCommonOrganizationLearners,
  update,
};
