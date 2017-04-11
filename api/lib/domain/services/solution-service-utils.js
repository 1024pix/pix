const _ = require('../../../lib/infrastructure/utils/lodash-utils');
const { t1, t2 } = require('./validation-treatments');
const { t3 } = require('./validation-comparison');

function treatmentT1T2T3(userAnswer, adminAnswers) {

  if (_.isNotArrayOfString(adminAnswers)) return null;
  if (_.isNotString(userAnswer)) return null;
  if (_.isEmpty(adminAnswers)) return null;

  return {
    userAnswer: userAnswer,
    adminAnswers: adminAnswers,
    t1: t1(userAnswer),
    t1t2: t2(t1(userAnswer)),
    t2: t2(userAnswer),
    t1t3Ratio: t3(t1(userAnswer), adminAnswers),
    t2t3Ratio: t3(t2(userAnswer), adminAnswers),
    t1t2t3Ratio: t3(t2(t1(userAnswer)), adminAnswers),
    t3Ratio: t3(userAnswer, adminAnswers),
  };
}

module.exports = {
  treatmentT1T2T3,
};
