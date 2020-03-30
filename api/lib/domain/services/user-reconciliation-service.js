const _ = require('lodash');
const { pipe } = require('lodash/fp');
const randomString = require('randomstring');

const {
  NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError, AlreadyRegisteredUsernameError
} = require('../errors');
const { areTwoStringsCloseEnough, isOneStringCloseEnoughFromMultipleStrings } = require('./string-comparison-service');
const { normalizeAndRemoveAccents, removeSpecialCharacters } = require('./validation-treatments');

const MAX_ACCEPTABLE_RATIO = 0.25;

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

async function findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({ organizationId, user: { firstName, lastName, birthdate }, schoolingRegistrationRepository }) {
  const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationIdAndUserBirthdate({
    organizationId,
    birthdate,
  });

  if (schoolingRegistrations.length === 0) {
    throw new NotFoundError('There were no schoolingRegistrations matching with organization and birthdate');
  }

  const schoolingRegistrationId = findMatchingCandidateIdForGivenUser(schoolingRegistrations, { firstName, lastName });

  if (!schoolingRegistrationId) {
    throw new NotFoundError('There were no schoolingRegistrations matching with names');
  }

  const matchingSchoolingRegistration = _.find(schoolingRegistrations, { 'id': schoolingRegistrationId });
  if (!_.isNil(matchingSchoolingRegistration.userId)) {
    throw new SchoolingRegistrationAlreadyLinkedToUserError();
  }

  return schoolingRegistrationId;
}

function _containsOneElement(arr) {
  return _.size(arr) === 1;
}

function _standardizeUser(user) {
  return _(user)
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
};
