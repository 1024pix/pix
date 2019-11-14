const { normalizeAndRemoveAccents, removeSpecialCharacters } = require('../services/validation-treatments');
const { getLevenshteinRatio, getSmallestLevenshteinRatio } = require('../services/validation-comparison');

const MAX_ACCEPTABLE_RATIO = 0.25;

function _areTwoStringsCloseEnough(inputString, reference) {
  return getLevenshteinRatio(inputString, reference) <= MAX_ACCEPTABLE_RATIO;
}

function _areTwoStringsCloseEnoughWithSeveralPossibilities(inputString, references) {
  return getSmallestLevenshteinRatio(inputString, references) <= MAX_ACCEPTABLE_RATIO;
}

function _standardize(stringToStandardize) {
  return removeSpecialCharacters(normalizeAndRemoveAccents(stringToStandardize));
}

function _findCandidatesMatchingWithUser(matchingUserCandidatesStandardized, standardizedUser, firstNameAlternative) {
  return matchingUserCandidatesStandardized.filter((candidate) =>
    candidate[firstNameAlternative] && candidate.lastName
      && _areTwoStringsCloseEnough(standardizedUser.firstName, candidate[firstNameAlternative])
      && _areTwoStringsCloseEnoughWithSeveralPossibilities(standardizedUser.lastName, [candidate.lastName, candidate.preferredLastName])
  );
}

function _standardizeUserAndMatchingUserCandidates(user, matchingUserCandidates) {
  const standardizedUser = {
    firstName: _standardize(user.firstName),
    lastName: _standardize(user.lastName)
  };

  const matchingUserCandidatesStandardized = matchingUserCandidates.map((candidate) => {
    return {
      id: candidate.id,
      firstName: candidate.firstName ? _standardize(candidate.firstName) : null,
      middleName: candidate.middleName ? _standardize(candidate.middleName) : null,
      thirdName: candidate.thirdName ? _standardize(candidate.thirdName) : null,
      lastName: candidate.lastName ? _standardize(candidate.lastName) : null,
      preferredLastName: candidate.preferredLastName ? _standardize(candidate.preferredLastName) : null,
    };
  });

  return { standardizedUser, matchingUserCandidatesStandardized };
}

function findMatchingCandidateIdForGivenUser(matchingUserCandidates, user) {

  const { standardizedUser, matchingUserCandidatesStandardized } = _standardizeUserAndMatchingUserCandidates(user, matchingUserCandidates);

  const fieldNamesForMatching = ['firstName', 'middleName', 'thirdName'];

  let foundCandidates;
  for (const fieldName of fieldNamesForMatching) {
    foundCandidates = _findCandidatesMatchingWithUser(matchingUserCandidatesStandardized, standardizedUser, fieldName);

    if (foundCandidates.length === 1) {
      return foundCandidates[0].id;
    }
  }
  return null;
}

module.exports = {
  findMatchingCandidateIdForGivenUser,
};
