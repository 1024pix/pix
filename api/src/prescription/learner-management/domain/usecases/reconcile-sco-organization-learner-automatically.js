import _ from 'lodash';

import { UserCouldNotBeReconciledError } from '../../../../shared/domain/errors.js';
import { OrganizationLearner } from '../models/OrganizationLearner.js';

const reconcileScoOrganizationLearnerAutomatically = async function ({
  organizationId,
  userId,
  organizationLearnerRepository,
  organizationLearnerImportFormatRepository,
}) {
  const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

  if (!importFormat) {
    const studentOrganizationLearners = await organizationLearnerRepository.findByUserId({ userId });
    if (_.isEmpty(studentOrganizationLearners)) {
      throw new UserCouldNotBeReconciledError();
    }
    const nationalStudentIdForReconcile = _.orderBy(studentOrganizationLearners, 'updatedAt', 'desc')[0]
      .nationalStudentId;

    if (!nationalStudentIdForReconcile) {
      throw new UserCouldNotBeReconciledError();
    }

    return organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId({
      userId,
      nationalStudentId: nationalStudentIdForReconcile,
      organizationId,
    });
  } else {
    const previousLearners = await organizationLearnerRepository.findByUserId({ userId });
    if (_.isEmpty(previousLearners)) {
      throw new UserCouldNotBeReconciledError();
    }
    const mostRecentUpdatedLearner = _.orderBy(previousLearners, 'updatedAt', 'desc')[0];
    const unicityCriteria = importFormat.config?.unicityColumns.reduce((acc, field) => {
      return { ...acc, [field]: mostRecentUpdatedLearner.attributes[field] };
    }, {});
    const matchingLearners = await organizationLearnerRepository.findAllCommonOrganizationLearnerByReconciliationInfos({
      organizationId,
      reconciliationInformations: unicityCriteria,
    });
    if (matchingLearners.length !== 1) {
      throw new UserCouldNotBeReconciledError();
    }
    const learnerToReconcile = matchingLearners[0];
    learnerToReconcile.reconcileUser(userId);
    await organizationLearnerRepository.update(learnerToReconcile);
    return new OrganizationLearner({ ...learnerToReconcile, ...learnerToReconcile.attributes });
  }
};

export { reconcileScoOrganizationLearnerAutomatically };
