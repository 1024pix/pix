const Skill = require('../../../lib/domain/models/Skill');
const SkillReview = require('../../../lib/domain/models/SkillReview');
const TargetProfile = require('../../../lib/domain/models/TargetProfile');

module.exports = function({ assessmentId, assessmentRepository, answerRepository, challengeRepository }) {

  const listOfTargetedSkills = [
    new Skill({ name: '@accesDonnées2' }),
    new Skill({ name: '@collecteDonnées2' }),
    new Skill({ name: '@infosPerso4' }),
    new Skill({ name: '@tracesLocales3' }),
    new Skill({ name: '@tracesPratiques6' }),
    new Skill({ name: '@archive4' }),
    new Skill({ name: '@fichier1' }),
    new Skill({ name: '@propFichier3' }),
    new Skill({ name: '@sauvegarde6' }),
    new Skill({ name: '@unite2' }),
  ];

  const targetProfile = TargetProfile.fromListOfSkill(listOfTargetedSkills);

  let answers;
  let assessment;
  let challenges;

  return answerRepository.findByAssessment(assessmentId)
    .then(fetchedAnswers => answers = fetchedAnswers)
    .then(() => challengeRepository.findBySkills(targetProfile.skills))
    .then(fetchedChallenges => challenges = fetchedChallenges)
    .then(() => assessmentRepository.get(assessmentId))
    .then(fetchedAssessment => assessment = fetchedAssessment)
    .then(() => assessment.addAnswersWithTheirChallenge(answers, challenges))
    .then(() => new SkillReview({ assessment, targetProfile }));

};
