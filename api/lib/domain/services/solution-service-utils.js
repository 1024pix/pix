const _ = require('../../../lib/infrastructure/utils/lodash-utils');
const levenshtein = require('fast-levenshtein');


function _getSmallestLevenshteinDistance(userAnswer, adminAnswers) {

  let min = levenshtein.get(userAnswer, adminAnswers[0]);

  if (adminAnswers.length === 1) {
    return min;
  }

  _.each (adminAnswers, (adminAnswer) => {
    const currentLevenshtein = levenshtein.get(userAnswer, adminAnswer);
    if (currentLevenshtein < min) {
      min = currentLevenshtein;
    }
  });

  return min;


}


function _treatmentT1(strArg) {
  // Remove uppercase/spaces/accents/diacritics, see http://stackoverflow.com/a/37511463/827989
  return strArg.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '');
}


function _treatmentT2(strArg) {
  // Remove punctuation
  return strArg.toString().replace(/[^a-zA-Z0-9 ]+/g, '').replace('/ {2,}/',' ').replace( /\s\s+/g, ' ' );
}

function _treatmentT3(userAnswer, adminAnswers) {
  return _getSmallestLevenshteinDistance(userAnswer, adminAnswers) / userAnswer.length;
}

function treatmentT1T2T3(userAnswer, adminAnswers) {

  if (_.isNotArrayOfString(adminAnswers)) return null;
  if (_.isNotString(userAnswer)) return null;
  if (_.isEmpty(adminAnswers)) return null;

  return {
    userAnswer: userAnswer,
    adminAnswers: adminAnswers,
    t1: _treatmentT1(userAnswer),
    t1t2: _treatmentT2(_treatmentT1(userAnswer)),
    t2: _treatmentT2(userAnswer),
    t1t3Ratio: _treatmentT3(_treatmentT1(userAnswer), adminAnswers),
    t2t3Ratio: _treatmentT3(_treatmentT2(userAnswer), adminAnswers),
    t1t2t3Ratio: _treatmentT3(_treatmentT2(_treatmentT1(userAnswer)), adminAnswers),
    t3Ratio: _treatmentT3(userAnswer, adminAnswers),
  };

}



module.exports = {
  _getSmallestLevenshteinDistance,
  _treatmentT1,
  _treatmentT2,
  _treatmentT3,
  treatmentT1T2T3,
};
