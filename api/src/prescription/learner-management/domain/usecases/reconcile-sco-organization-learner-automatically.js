import _ from 'lodash';

import { UserCouldNotBeReconciledError } from '../../../../shared/domain/errors.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const reconcileScoOrganizationLearnerAutomatically = async function ({
  organizationId,
  userId,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
} = {}) {
  const studentOrganizationLearners = await organizationLearnerRepository.findByUserId({ userId });
  if (_.isEmpty(studentOrganizationLearners)) {
    throw new UserCouldNotBeReconciledError();
  }

  const nationalStudentIdForReconcile = _.orderBy(studentOrganizationLearners, 'updatedAt', 'desc')[0]
    .nationalStudentId;

  return organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId({
    userId,
    nationalStudentId: nationalStudentIdForReconcile,
    organizationId,
  });
};

export { reconcileScoOrganizationLearnerAutomatically };
