const {
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
    nationalStudentId: studentInformation.ineIna,
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

async function _getUserIdByMatchingStudentInformationWithSchoolingRegistration({
  studentInformation,
  latestSchoolingRegistration,
  userReconciliationService,
}) {
  const matchingSchoolingRegistrationId = await userReconciliationService.findMatchingCandidateIdForGivenUser(
    [ latestSchoolingRegistration ],
    { firstName: studentInformation.firstName, lastName: studentInformation.lastName },
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
};

