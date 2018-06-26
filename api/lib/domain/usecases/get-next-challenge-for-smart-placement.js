const { AssessmentEndedError } = require('../errors');
const SkillsProfile = require('../models/SkillsProfile');
const Skill = require('../models/Skill');
const SmartRandom = require('../strategies/SmartRandom');
const _ = require('lodash');

const listSkills = [
  '@composantsMatériels1',
  '@fichetechnique2',
  '@connectique2',
  '@problèmeClavier2',
  '@appliOS1',
  '@recherche1',
  '@environnementTravail1',
  '@outilsTexte1',
  '@saisiePratique1',
  '@copierColler1',
  '@miseEnFormeTttTxt1',
  '@miseEnFormeTexte1',
  '@form_intero2',
  '@remplir1',
  '@tri1',
  '@outilsMsgélectronique1',
  '@champscourriel1',
  '@moteur1',
  '@rechinfo3',
  '@utiliserserv3',
  '@eval4',
  '@fonctionnementTwitter4',
  '@outilsRS3',
  '@outilsMsgélectronique1',
  '@outilsMessagerie3',
  '@champscourriel3',
  '@gestionMails3',
  '@PJ2',
  '@netiquette3',
  '@agendaPartage2',
  '@outilscollaboratifs3',
  '@editerDocEnLigne4',
  '@editionEnLigne3',
  '@partageDroits3',
  '@sauvegarde2',
  '@support2',
  '@methodo3',
  '@accèsdonnées2',
  '@sécuriseraccès2',
  '@sourcesInfection2',
  '@logmalveillant2',
  '@phishing3',
  '@logprotection2',
  '@outilsprotection2',
  '@choixmotdepasse2',
  '@identitenum4',
  '@e-reputation3',
  '@charteInfo3',
];

function getNextChallengeInSmartRandom(answersPix, challengesPix, skills) {
  const smartRandom = new SmartRandom (answersPix, challengesPix, skills);
  const nextChallenge = smartRandom.getNextChallenge();
  return _.get(nextChallenge, 'id', null);
}

module.exports = function({
  assessment,
  answerRepository,
  challengeRepository,
} = {}) {

  let answers, challenges;

  const skillsProfile = SkillsProfile.fromListOfSkill(listSkills.map(skill => new Skill({ name: skill })));

  return answerRepository.findByAssessment(assessment.id)
    .then(fetchedAnswers => (answers = fetchedAnswers))
    .then(() => challengeRepository.findBySkills(skillsProfile.skills))
    .then(fetchedChallenges => (challenges = fetchedChallenges))
    .then(() => getNextChallengeInSmartRandom(answers, challenges, skillsProfile.skills))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);

};
