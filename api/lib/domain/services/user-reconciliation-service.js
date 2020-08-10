const _ = require('lodash');
const { pipe } = require('lodash/fp');
const randomString = require('randomstring');

const {
  NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError, AlreadyRegisteredUsernameError
} = require('../errors');
const { areTwoStringsCloseEnough, isOneStringCloseEnoughFromMultipleStrings } = require('./string-comparison-service');
const { getUserAuthenticationMethodWithObfuscation } = require('./obfuscation-service');
const { normalizeAndRemoveAccents, removeSpecialCharacters } = require('./validation-treatments');

const MAX_ACCEPTABLE_RATIO = 0.25;

const STUDENT_RECONCILIATION_ERRORS = {
  IN_OTHER_ORGANIZATION: {
    samlId: { shortCode: 'R13', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
    username: { shortCode: 'R12', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
    email: { shortCode: 'R11', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
  }
  ,
  IN_SAME_ORGANIZATION: {
    samlId: { shortCode: 'R33', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
    username: { shortCode: 'R32', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
    email: { shortCode: 'R31', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
  }
};

function findMatchingCandidateIdForGivenUser(matchingUserCandidates, user) {
  const standardizedUser = _standardizeUser(user);
  const standardizedMatchingUserCandidates = _.map(matchingUserCandidates, _standardizeMatchingCandidate);

  return _(['firstName', 'middleName', 'thirdName'])
    .map(_findCandidatesMatchingWithUser(standardizedMatchingUserCandidates, standardizedUser))
    .filter(_containsOneElement)
    .flatten()
    .map('id')
    .first() || null;
}

async function findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
  organizationId,
  reconciliationInfo: { firstName, lastName, birthdate, studentNumber },
  schoolingRegistrationRepository,
  userRepository
}) {
  const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationIdAndUserData({
    organizationId,
    reconciliationInfo: { birthdate, studentNumber },
  });

  if (_.isEmpty(schoolingRegistrations)) {
    throw new NotFoundError('There are no schooling registrations found');
  }

  let schoolingRegistration;
  if (studentNumber) {
    schoolingRegistration = schoolingRegistrations[0];
  } else {
    const schoolingRegistrationId = findMatchingCandidateIdForGivenUser(schoolingRegistrations, { firstName, lastName });

    if (!schoolingRegistrationId) {
      throw new NotFoundError('There were no schoolingRegistrations matching with names');
    }
    schoolingRegistration = _.find(schoolingRegistrations, { 'id': schoolingRegistrationId });
  }

  await checkIfStudentIsAlreadyReconciledOnTheSameOrganization(schoolingRegistration, userRepository);

  return schoolingRegistration;
}

async function checkIfStudentIsAlreadyReconciledOnTheSameOrganization(matchingSchoolingRegistration, userRepository) {
  if (!_.isNil(matchingSchoolingRegistration.userId))  {
    const userId = matchingSchoolingRegistration.userId ;
    const user = await userRepository.getUserAuthenticationMethods(userId);
    const authentificationMethod = getUserAuthenticationMethodWithObfuscation(user);

    const detail = 'Un compte existe déjà pour l‘élève dans le même établissement.';
    const error = STUDENT_RECONCILIATION_ERRORS.IN_SAME_ORGANIZATION[authentificationMethod.authenticatedBy];
    const meta = { shortCode: error.shortCode, value: authentificationMethod.value };
    throw new SchoolingRegistrationAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

async function checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository) {
  if (_.get(student, 'account')) {
    const userId = student.account.userId;
    const user = await userRepository.getUserAuthenticationMethods(userId);
    const authentificationMethod = getUserAuthenticationMethodWithObfuscation(user);

    const detail = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
    const error = STUDENT_RECONCILIATION_ERRORS.IN_OTHER_ORGANIZATION[authentificationMethod.authenticatedBy];
    const meta = { shortCode: error.shortCode, value: authentificationMethod.value };
    throw new SchoolingRegistrationAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

function _containsOneElement(arr) {
  return _.size(arr) === 1;
}

function _standardizeUser(reconciliationInfo) {
  return _(reconciliationInfo)
    .pick(['firstName', 'lastName'])
    .mapValues(_standardize)
    .value();
}

function _standardizeMatchingCandidate(matchingUserCandidate) {
  return _(matchingUserCandidate)
    .pick(['id', 'firstName', 'middleName', 'thirdName', 'lastName', 'preferredLastName'])
    .mapValues(_standardize)
    .value();
}

function _standardize(propToStandardize) {
  return _.isString(propToStandardize)
    ? pipe(normalizeAndRemoveAccents, removeSpecialCharacters)(propToStandardize)
    : propToStandardize;
}

// A given name refers to either a first name, middle name or third name
function _findCandidatesMatchingWithUser(matchingUserCandidatesStandardized, standardizedUser) {
  return (candidateGivenName) => matchingUserCandidatesStandardized
    .filter(_candidateHasSimilarFirstName(standardizedUser, candidateGivenName))
    .filter(_candidateHasSimilarLastName(standardizedUser));
}

function _candidateHasSimilarFirstName({ firstName: userFirstName }, candidateGivenName) {
  return (candidate) => candidate[candidateGivenName] && areTwoStringsCloseEnough(userFirstName, candidate[candidateGivenName], MAX_ACCEPTABLE_RATIO);
}

function _candidateHasSimilarLastName({ lastName }) {
  return (candidate) => {
    const candidatesLastName = [candidate.lastName, candidate.preferredLastName]
      .filter((candidateLastName) => candidateLastName);
    return isOneStringCloseEnoughFromMultipleStrings(lastName, candidatesLastName, MAX_ACCEPTABLE_RATIO);
  };
}

// TODO Export all functions generating random codes to an appropriate service
const _generateCode = () => {
  return randomString.generate({ length: 4, charset: 'numeric' });
};

async function generateUsernameUntilAvailable({ firstPart, secondPart, userRepository }) {
  let randomPart = secondPart;

  let username;
  let isUsernameAvailable;

  do {
    username = firstPart + randomPart;
    isUsernameAvailable = true;

    try {
      await userRepository.isUsernameAvailable(username);
    } catch (error) {
      if (error instanceof AlreadyRegisteredUsernameError) {
        isUsernameAvailable = false;
        randomPart = _generateCode();
      } else {
        throw error;
      }
    }
  } while (!isUsernameAvailable);

  return username;
}

async function createUsernameByUser({ user: { firstName, lastName, birthdate }, userRepository }) {
  const standardizeUser = _standardizeUser({ firstName, lastName });
  const [ , month, day ] = birthdate.split('-');

  const firstPart = standardizeUser.firstName + '.' + standardizeUser.lastName;
  const secondPart = day + month;

  const username = await generateUsernameUntilAvailable({ firstPart, secondPart, userRepository });

  return username;
}

module.exports = {
  generateUsernameUntilAvailable,
  createUsernameByUser,
  findMatchingCandidateIdForGivenUser,
  findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser,
  checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations
};
