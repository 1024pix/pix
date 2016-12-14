const _ = require('lodash');

function _arrayToNonEmptyStringArray(arr) {
  if (_.isArray(arr)) {
    return arr.filter(e => e != null).map(String);
  } 
  return [];
}

function areStringListEquivalent(listA, listB) {
  let result = false;
  try {
    const trimmedListA = listA.split(',').map(s => s.trim());
    const trimmedListB = listB.split(',').map(s => s.trim());
    result = (trimmedListA.sort().join(',') === trimmedListB.sort().join(','));
  } catch (e) {
    result = false;
  }
  return result;
}

function removeAccentsSpacesUppercase(rawAnswer) {
  // Remove accents/diacritics in a string in JavaScript
  // http://stackoverflow.com/a/37511463/827989
  return rawAnswer.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function fuzzyMatchingWithAnswers(userAnswer, correctAnswersList) {
  userAnswer = removeAccentsSpacesUppercase(userAnswer);
  const correctAnswersArray = _arrayToNonEmptyStringArray(correctAnswersList);
  return _.some(correctAnswersArray, function(possibleAnswer) {
    return userAnswer == removeAccentsSpacesUppercase(possibleAnswer);
  });
}

module.exports = {
  removeAccentsSpacesUppercase,
  fuzzyMatchingWithAnswers,
  areStringListEquivalent
};
