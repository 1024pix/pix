const { AssessmentEndedError } = require('../errors');
const SkillsProfile = require('../models/SkillsProfile');
const Skill = require('../models/Skill');
const SmartRandom = require('../strategies/SmartRandom');
const _ = require('lodash');

const listOfTargetedSkillNames = [
  '@accesDonnées2',
  '@collecteDonnées2',
  '@infosPerso4',
  '@tracesLocales3',
  '@tracesPratiques6',
  '@archive4',
  '@fichier1',
  '@propFichier3',
  '@sauvegarde6',
  '@unite2',
];

function getNextChallengeInSmartRandom(answersPix, challengesPix, skills) {
  const smartRandom = new SmartRandom(answersPix, challengesPix, skills);
  const nextChallenge = smartRandom.getNextChallenge();
  return _.get(nextChallenge, 'id', null);
}

module.exports = function({
  assessment,
  answerRepository,
  challengeRepository,
} = {}) {

  let answers, challenges;

  const listOfSkills = listOfTargetedSkillNames.map(skill => new Skill({ name: skill }));
  const skillsProfile = SkillsProfile.fromListOfSkill(listOfSkills);

  return answerRepository.findByAssessment(assessment.id)
    .then(fetchedAnswers => (answers = fetchedAnswers))
    .then(() => challengeRepository.findBySkills(skillsProfile.skills))
    .then(fetchedChallenges => (challenges = fetchedChallenges))
    .then(() => getNextChallengeInSmartRandom({
      answers,
      challenges,
      skillsProfile,
    }))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);

};
