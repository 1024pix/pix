const SkillReview = require('../../../lib/domain/models/SkillReview');
const TargetProfile = require('../../../lib/domain/models/TargetProfile');
const { NotFoundError } = require('../../../lib/domain/errors');

module.exports = function({ assessmentId, assessmentRepository, answerRepository, challengeRepository }) {

  const targetProfile = TargetProfile.TEST_PROFIL;

  let answers;
  let assessment;
  let challenges;

  return answerRepository.findByAssessment(assessmentId)
    .then(fetchedAnswers => answers = fetchedAnswers)
    .then(() => challengeRepository.findBySkills(targetProfile.skills))
    .then(fetchedChallenges => challenges = fetchedChallenges)
    .then(() => assessmentRepository.get(assessmentId))
    .then(fetchedAssessment => {
      if(!fetchedAssessment) throw new NotFoundError();

      assessment = fetchedAssessment;
    })
    .then(() => assessment.addAnswersWithTheirChallenge(answers, challenges))
    .then(() => new SkillReview({ assessment, targetProfile }));

};
