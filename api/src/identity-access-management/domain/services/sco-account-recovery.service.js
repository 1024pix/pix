import lodash from 'lodash';

import {
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  UserNotFoundError,
} from '../../../shared/domain/errors.js';

const { uniqBy } = lodash;

async function retrieveOrganizationLearner({
  studentInformation,
  organizationLearnerRepository,
  userReconciliationService,
}) {
  const latestOrganizationLearner = await organizationLearnerRepository.getLatestOrganizationLearner({
    birthdate: studentInformation.birthdate,
    nationalStudentId: studentInformation.ineIna.toUpperCase(),
  });

  const matchingOrganizationLearnerId = await userReconciliationService.findMatchingCandidateIdForGivenUser(
    [latestOrganizationLearner],
    { firstName: studentInformation.firstName, lastName: studentInformation.lastName },
  );
  if (!matchingOrganizationLearnerId) {
    throw new UserNotFoundError();
  }

  const { id, userId, firstName, lastName, organizationId } = latestOrganizationLearner;

  const organizationLearners = await organizationLearnerRepository.findByUserId({ userId });
  const nonEmptyNationalStudentIds = organizationLearners.filter((learner) => !!learner.nationalStudentId);
  if (uniqBy(nonEmptyNationalStudentIds, 'nationalStudentId').length > 1) {
    throw new MultipleOrganizationLearnersWithDifferentNationalStudentIdError();
  }

  return { id, userId, firstName, lastName, organizationId };
}

export const scoAccountRecoveryService = { retrieveOrganizationLearner };
