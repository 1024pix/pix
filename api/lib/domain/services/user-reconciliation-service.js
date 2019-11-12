const { t1, t2 } = require('../services/validation-treatments');
const { getLevenshteinRatio } = require('../services/validation-comparison');

function _areTwoStringsCloseEnough(inputString, reference) {
  return getLevenshteinRatio(inputString, reference) <= 0.25;
}

function findMatchingPretenderIdForGivenUser(matchingUserPretenders, user) {

  const standardizedUser = {
    firstName: t2(t1(user.firstName)),
    lastName: t2(t1(user.lastName))
  };

  const matchingUserPretendersStandardized = matchingUserPretenders.map((pretender) => {
    return {
      id: pretender.id,
      firstName: pretender.firstName ? t2(t1(pretender.firstName)) : null,
      middleName: pretender.middleName ? t2(t1(pretender.middleName)) : null,
      thirdName: pretender.thirdName ? t2(t1(pretender.thirdName)) : null,
      lastName: pretender.lastName ? t2(t1(pretender.lastName)) : null,
      preferredLastName: pretender.preferredLastName ? t2(t1(pretender.preferredLastName)) : null,
    };
  });

  let foundPretender = matchingUserPretendersStandardized.filter((pretender) => {
    if (pretender && pretender.firstName && pretender.lastName) {
      return _areTwoStringsCloseEnough(standardizedUser.firstName, pretender.firstName)
        && (_areTwoStringsCloseEnough(standardizedUser.lastName, pretender.lastName) || _areTwoStringsCloseEnough(standardizedUser.lastName, pretender.preferredLastName));
    }
  });

  if (foundPretender.length !== 1) {
    foundPretender = matchingUserPretendersStandardized.filter((pretender) => {
      if (pretender.middleName && pretender.lastName) {
        return _areTwoStringsCloseEnough(standardizedUser.firstName, pretender.middleName) && (_areTwoStringsCloseEnough(standardizedUser.lastName, pretender.lastName) || _areTwoStringsCloseEnough(standardizedUser.lastName, pretender.preferredLastName));
      }
    });
  }

  if (foundPretender.length !== 1) {
    foundPretender = matchingUserPretendersStandardized.filter((pretender) => {
      if (pretender.thirdName && pretender.lastName) {
        return _areTwoStringsCloseEnough(standardizedUser.firstName, pretender.thirdName) && (_areTwoStringsCloseEnough(standardizedUser.lastName, pretender.lastName) || _areTwoStringsCloseEnough(standardizedUser.lastName, pretender.preferredLastName));
      }
    });
  }

  if (foundPretender.length !== 1) {
    return null;
  }

  return foundPretender[0].id;
}

module.exports = {
  findMatchingPretenderIdForGivenUser,
};
