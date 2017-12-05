const minimumReproductibilityToBeCertified = 50;
const minimumReproductibilityToBeTrusted = 80;
const numberOfPixForOneLevel = 8;
const _ = require('lodash');
const answerServices = require('./answer-service');

function _computeSumPixFromCompetences(listCompetences) {
  return  _.sumBy(listCompetences, c => c.pixScore);
}

function _enhanceAnswersWithCompetenceId(listAnswers, listChallenges) {
  return _.map(listAnswers, (answer) => {
    const competenceId = listChallenges
      .find((challenge) => challenge.get('challengeId') === answer.get('challengeId'))
      .get('competenceId');
    answer.set('competenceId', competenceId);
    return answer;
  });
}

function _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence) {
  return _(answersWithCompetences)
    .filter(answer => answer.get('competenceId') === competence.id)
    .filter(answer => answer.get('result') === 'ok')
    .size();
}

function _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence, reproductibility) {
  if (numberOfCorrectAnswers < 2) {
    return competence.pixScore;
  }
  if(reproductibility < minimumReproductibilityToBeTrusted && numberOfCorrectAnswers === 2) {
    return numberOfPixForOneLevel;
  }
  return 0;
}

function _getMalusPix(answersWithCompetences, listCompetences, reproductibility) {
  return listCompetences.reduce((malus, competence) => {
    const numberOfCorrectAnswers = _numberOfCorrectAnswersPerCompetence(answersWithCompetences, competence);
    return malus + _computedPixToRemovePerCompetence(numberOfCorrectAnswers, competence, reproductibility);
  }, 0);
}

module.exports = {
  getScore(listAnswers, listChallenges, listCompetences) {
    const reproductibility = answerServices.getAnswersSuccessRate(listAnswers);
    if (reproductibility < minimumReproductibilityToBeCertified) {
      return 0;
    }

    const actualPix = _computeSumPixFromCompetences(listCompetences);
    const answersByCompetences = _enhanceAnswersWithCompetenceId(listAnswers, listChallenges);
    const pixToRemove = _getMalusPix(answersByCompetences, listCompetences, reproductibility);

    return actualPix - pixToRemove;
  }
};
