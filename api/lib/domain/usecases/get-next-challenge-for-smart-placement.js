const { AssessmentEndedError } = require('../errors');
const TargetedSkill = require('../models/TargetedSkill');
const Skill = require('../models/Skill');
const SmartRandom = require('../models/SmartRandom');
const _ = require('lodash');
const listSkills = ['@accesDonnées2',
  '@collecteDonnée2',
  '@infosPerso4',
  '@traceslocales3',
  '@tracesPratiques6',
  '@archive4',
  '@fichier1',
  '@propFichier3',
  '@sauvegarde6',
  '@unite2'];

module.exports = function({
  assessment,
  answerRepository,
  challengeRepository,
} = {}) {

  let answers, challenges;

  const targetedSkills = TargetedSkill.fromListOfSkill(listSkills.map(skill => new Skill({ name: skill })));

  return answerRepository.findByAssessment(assessment.id)
    .then(fetchedAnswers => (answers = fetchedAnswers))
    .then(() => challengeRepository.findBySkills(targetedSkills.skills))
    .then(fetchedChallenges => (challenges = fetchedChallenges))
    .then(() => getNextChallengeInAdaptiveCourse(answers, challenges, targetedSkills.skills))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);

};

function getNextChallengeInAdaptiveCourse(answersPix, challengesPix, skills) {
  const smartRandom = new SmartRandom (answersPix, challengesPix, skills);
  const nextChallenge = smartRandom.getNextChallenge();
  return _.get(nextChallenge, 'id', null);
}

