import { features } from '../../config';

import {
  AccountRecoveryDemandExpired,
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  UserNotFoundError,
  UserHasAlreadyLeftSCO,
} from '../errors';

import { uniqBy } from 'lodash';

async function retrieveOrganizationLearner({
  accountRecoveryDemandRepository,
  studentInformation,
  organizationLearnerRepository,
  userRepository,
  userReconciliationService,
}) {
  const latestOrganizationLearner = await organizationLearnerRepository.getLatestOrganizationLearner({
    birthdate: studentInformation.birthdate,
    nationalStudentId: studentInformation.ineIna.toUpperCase(),
  });

  const userId = await _getUserIdByMatchingStudentInformationWithOrganizationLearner({
    studentInformation,
    latestOrganizationLearner,
    userReconciliationService,
  });

  const accountRecoveryDemands = await accountRecoveryDemandRepository.findByUserId(userId);

  if (accountRecoveryDemands.some((accountRecoveryDemand) => accountRecoveryDemand.used)) {
    throw new UserHasAlreadyLeftSCO();
  }

  await _checkIfThereAreMultipleUserForTheSameAccount({ userId, organizationLearnerRepository });

  const { username, email } = await userRepository.get(userId);

  const { id, firstName, lastName, organizationId } = latestOrganizationLearner;

  return { id, userId, firstName, lastName, username, organizationId, email };
}

async function retrieveAndValidateAccountRecoveryDemand({
  temporaryKey,
  userRepository,
  accountRecoveryDemandRepository,
}) {
  const { id, userId, newEmail, organizationLearnerId, createdAt } =
    await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  await userRepository.checkIfEmailIsAvailable(newEmail);

  const accountRecoveryDemands = await accountRecoveryDemandRepository.findByUserId(userId);

  if (accountRecoveryDemands.some((accountRecoveryDemand) => accountRecoveryDemand.used)) {
    throw new UserHasAlreadyLeftSCO();
  }

  if (_demandHasExpired(createdAt)) {
    throw new AccountRecoveryDemandExpired();
  }

  return { id, userId, newEmail, organizationLearnerId };
}

function _demandHasExpired(demandCreationDate) {
  const minutesInADay = 60 * 24;
  const lifetimeInMinutes = parseInt(features.scoAccountRecoveryKeyLifetimeMinutes) || minutesInADay;
  const millisecondsInAMinute = 60 * 1000;
  const lifetimeInMilliseconds = lifetimeInMinutes * millisecondsInAMinute;

  const expirationDate = new Date(demandCreationDate.getTime() + lifetimeInMilliseconds);
  const now = new Date();

  return expirationDate < now;
}

async function _getUserIdByMatchingStudentInformationWithOrganizationLearner({
  studentInformation,
  latestOrganizationLearner,
  userReconciliationService,
}) {
  const matchingOrganizationLearnerId = await userReconciliationService.findMatchingCandidateIdForGivenUser(
    [latestOrganizationLearner],
    { firstName: studentInformation.firstName, lastName: studentInformation.lastName }
  );

  if (!matchingOrganizationLearnerId) {
    throw new UserNotFoundError();
  }

  return latestOrganizationLearner.userId;
}

async function _checkIfThereAreMultipleUserForTheSameAccount({ userId, organizationLearnerRepository }) {
  const organizationLearners = await organizationLearnerRepository.findByUserId({ userId });
  const nonEmptyNationalStudentIds = organizationLearners.filter((learner) => !!learner.nationalStudentId);

  if (uniqBy(nonEmptyNationalStudentIds, 'nationalStudentId').length > 1) {
    throw new MultipleOrganizationLearnersWithDifferentNationalStudentIdError();
  }
}

export default {
  retrieveOrganizationLearner,
  retrieveAndValidateAccountRecoveryDemand,
};
