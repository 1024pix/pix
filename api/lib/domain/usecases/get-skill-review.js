const SkillReview = require('../../../lib/domain/models/SkillReview');
const { UserNotAuthorizedToAccessEntity } = require('../../../lib/domain/errors');

module.exports = function({
  skillReviewId,
  userId,
  smartPlacementAssessmentRepository,
}) {

  const assessmentId = SkillReview.getAssessmentIdFromId(skillReviewId);

  return smartPlacementAssessmentRepository.get(assessmentId)
    .then((assessment) => {
      if(`${assessment.userId}` !== `${userId}`) {
        throw new UserNotAuthorizedToAccessEntity();
      }

      return assessment.generateSkillReview();
    });
};
