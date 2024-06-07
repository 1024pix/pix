import _ from 'lodash';

import { OrganizationLearnersCouldNotBeSavedError } from '../../../../../lib/domain/errors.js';
import { OrganizationLearner } from '../../../../../lib/domain/models/index.js';
import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
import { CommonOrganizationLearner } from '../../domain/models/ImportOrganizationLearnerSet.js';

const removeByIds = function ({ organizationLearnerIds, userId, domainTransaction }) {
  return domainTransaction
    .knexTransaction('organization-learners')
    .whereIn('id', organizationLearnerIds)
    .whereNull('deletedAt')
    .update({ deletedAt: new Date(), deletedBy: userId });
};

const disableAllOrganizationLearnersInOrganization = async function ({
  domainTransaction,
  organizationId,
  nationalStudentIds,
}) {
  const knexConn = domainTransaction.knexTransaction;
  await knexConn('organization-learners')
    .where({ organizationId, isDisabled: false })
    .whereNotIn('nationalStudentId', nationalStudentIds)
    .update({ isDisabled: true, updatedAt: knexConn.raw('CURRENT_TIMESTAMP') });
};

const addOrUpdateOrganizationOfOrganizationLearners = async function (
  organizationLearnerDatas,
  organizationId,
  domainTransaction,
) {
  const knexConn = domainTransaction.knexTransaction;
  const organizationLearnersFromFile = organizationLearnerDatas.map(
    (organizationLearnerData) =>
      new OrganizationLearner({
        ...organizationLearnerData,
        organizationId,
      }),
  );
  const existingOrganizationLearners = await organizationLearnerRepository.findByOrganizationId(
    { organizationId },
    domainTransaction,
  );

  const reconciledOrganizationLearnersToImport = await organizationLearnerRepository._reconcileOrganizationLearners(
    organizationLearnersFromFile,
    existingOrganizationLearners,
    domainTransaction,
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
  return knex('organization-learners').insert(learners);
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

export {
  addOrUpdateOrganizationOfOrganizationLearners,
  disableAllOrganizationLearnersInOrganization,
  disableCommonOrganizationLearnersFromOrganizationId,
  findAllCommonLearnersFromOrganizationId,
  removeByIds,
  saveCommonOrganizationLearners,
};
