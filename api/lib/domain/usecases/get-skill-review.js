const SkillReview = require('../../../lib/domain/models/SkillReview');
const TargetProfile = require('../../../lib/domain/models/TargetProfile');
const Course = require('../../../lib/domain/models/Course');
const { NotFoundError, ForbiddenAccess } = require('../../../lib/domain/errors');

module.exports = function({ skillReviewId, userId, assessmentRepository, answerRepository, challengeRepository }) {

  const assessmentId = skillReviewId;
  const targetProfile = TargetProfile.TEST_PROFIL;

  let answers;
  let assessment;
  let challenges;

  const fakeCourseForSmartPlacement = new Course({});
  fakeCourseForSmartPlacement.computeTubes(targetProfile.skills);

  return answerRepository.findByAssessment(assessmentId)
    .then(fetchedAnswers => answers = fetchedAnswers)
    .then(() => challengeRepository.findBySkills(targetProfile.skills))
    .then(fetchedChallenges => challenges = fetchedChallenges)
    .then(() => assessmentRepository.get(assessmentId))
    .then(fetchedAssessment => {
      if(!fetchedAssessment) throw new NotFoundError();

      if(fetchedAssessment.userId !== userId) throw new ForbiddenAccess();

      assessment = fetchedAssessment;
      assessment.course = fakeCourseForSmartPlacement;
    })
    .then(() => assessment.addAnswersWithTheirChallenge(answers, challenges))
    .then(() => new SkillReview({ assessment, targetProfile }));

};
