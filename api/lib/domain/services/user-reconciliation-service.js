const { normalizeAndRemoveAccents, removeSpecialCharacters } = require('./validation-treatments');
const { areTwoStringsCloseEnough, isOneStringCloseEnoughFromMultipleStrings } = require('./string-comparison-service');
const { pipe } = require('lodash/fp');
const _ = require('lodash');

const MAX_ACCEPTABLE_RATIO = 0.25;

function findMatchingCandidateIdForGivenUser(matchingUserCandidates, user) {
  const standardizedUser = _standardizeUser(user);
  const standardizedMatchingUserCandidates = _.map(matchingUserCandidates, _standardizeMatchingCandidate);

  return _(['firstName', 'middleName', 'thirdName'])
    .map(_findCandidatesMatchingWithUser(standardizedMatchingUserCandidates, standardizedUser))
    .filter(containsOneElement)
    .flatten()
    .map('id')
    .first() || null;
}

function containsOneElement(arr) {
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
  return (candidate) => areTwoStringsCloseEnough(userFirstName, candidate[candidateGivenName], MAX_ACCEPTABLE_RATIO);
}

function _candidateHasSimilarLastName({ lastName }) {
  return (candidate) => isOneStringCloseEnoughFromMultipleStrings(lastName, [candidate.lastName, candidate.preferredLastName], MAX_ACCEPTABLE_RATIO);
}

module.exports = {
  findMatchingCandidateIdForGivenUser,
};
