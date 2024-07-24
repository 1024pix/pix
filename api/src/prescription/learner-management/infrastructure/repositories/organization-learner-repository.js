import _ from 'lodash';

import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { OrganizationLearnersCouldNotBeSavedError } from '../../../../shared/domain/errors.js';
import { OrganizationLearner } from '../../../../shared/domain/models/index.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
import { CommonOrganizationLearner } from '../../domain/models/CommonOrganizationLearner.js';

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

  if (reconciliationInformations.attributes) {
    query.whereJsonSupersetOf('attributes', reconciliationInformations.attributes);
  }

  if (reconciliationInformations.firstName) {
    query.where('firstName', reconciliationInformations.firstName);
  }

  if (reconciliationInformations.lastName) {
    query.where('lastName', reconciliationInformations.lastName);
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

export {
  addOrUpdateOrganizationOfOrganizationLearners,
  disableAllOrganizationLearnersInOrganization,
  disableCommonOrganizationLearnersFromOrganizationId,
  findAllCommonLearnersFromOrganizationId,
  findAllCommonOrganizationLearnerByReconciliationInfos,
  removeByIds,
  saveCommonOrganizationLearners,
  update,
};
