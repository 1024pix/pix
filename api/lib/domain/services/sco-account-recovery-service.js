const {
  AccountRecoveryDemandExpired,
  MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError,
  UserNotFoundError,
  UserHasAlreadyLeftSCO,
} = require('../errors');
const _ = require('lodash');

async function retrieveSchoolingRegistration({
  accountRecoveryDemandRepository,
  studentInformation,
  schoolingRegistrationRepository,
  userRepository,
  userReconciliationService,
}) {
  const latestSchoolingRegistration = await schoolingRegistrationRepository.getLatestSchoolingRegistration({
    birthdate: studentInformation.birthdate,
    nationalStudentId: studentInformation.ineIna.toUpperCase(),
  });

  const userId = await _getUserIdByMatchingStudentInformationWithSchoolingRegistration({
    studentInformation,
    latestSchoolingRegistration,
    userReconciliationService,
  });

  const accountRecoveryDemands = await accountRecoveryDemandRepository.findByUserId(userId);

  if (accountRecoveryDemands.some((accountRecoveryDemand) => accountRecoveryDemand.used)) {
    throw new UserHasAlreadyLeftSCO();
  }

  await _checkIfThereAreMultipleUserForTheSameAccount({ userId, schoolingRegistrationRepository });

  const { username, email } = await userRepository.get(userId);

  const { id, firstName, lastName, organizationId } = latestSchoolingRegistration;

  return { id, userId, firstName, lastName, username, organizationId, email };
}

async function retrieveAndValidateAccountRecoveryDemand({
  temporaryKey,
  userRepository,
  accountRecoveryDemandRepository,
}) {
  const { id, userId, newEmail, schoolingRegistrationId, createdAt } =
    await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  await userRepository.checkIfEmailIsAvailable(newEmail);

  const accountRecoveryDemands = await accountRecoveryDemandRepository.findByUserId(userId);

  if (accountRecoveryDemands.some((accountRecoveryDemand) => accountRecoveryDemand.used)) {
    throw new UserHasAlreadyLeftSCO();
  }

  if (_demandHasExpired(createdAt)) {
    throw new AccountRecoveryDemandExpired();
  }

  return { id, userId, newEmail, schoolingRegistrationId };
}

function _demandHasExpired(demandCreationDate) {
  const minutesInADay = 60 * 24;
  const lifetimeInMinutes = parseInt(process.env.SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES) || minutesInADay;
  const millisecondsInAMinute = 60 * 1000;
  const lifetimeInMilliseconds = lifetimeInMinutes * millisecondsInAMinute;

  const expirationDate = new Date(demandCreationDate.getTime() + lifetimeInMilliseconds);
  const now = new Date();

  return expirationDate < now;
}

async function _getUserIdByMatchingStudentInformationWithSchoolingRegistration({
  studentInformation,
  latestSchoolingRegistration,
  userReconciliationService,
}) {
  const matchingSchoolingRegistrationId = await userReconciliationService.findMatchingCandidateIdForGivenUser(
    [latestSchoolingRegistration],
    { firstName: studentInformation.firstName, lastName: studentInformation.lastName }
  );

  if (!matchingSchoolingRegistrationId) {
    throw new UserNotFoundError();
  }

  return latestSchoolingRegistration.userId;
}

async function _checkIfThereAreMultipleUserForTheSameAccount({ userId, schoolingRegistrationRepository }) {
  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

  if (_.uniqBy(schoolingRegistrations, 'nationalStudentId').length > 1) {
    throw new MultipleSchoolingRegistrationsWithDifferentNationalStudentIdError();
  }
}

module.exports = {
  retrieveSchoolingRegistration,
  retrieveAndValidateAccountRecoveryDemand,
};
