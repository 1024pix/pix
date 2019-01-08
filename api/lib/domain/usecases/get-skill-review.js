const moment = require('moment');
const SkillReview = require('../../../lib/domain/models/SkillReview');
const { UserNotAuthorizedToAccessEntity } = require('../../../lib/domain/errors');

module.exports = async function getSkillReview(
  {
    skillReviewId,
    userId,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository
  }) {

  const assessmentId = SkillReview.getAssessmentIdFromId(skillReviewId);

  const assessment = await smartPlacementAssessmentRepository.get(assessmentId);
  if(`${assessment.userId}` !== `${userId}`) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const allKnowledgeElements = await smartPlacementKnowledgeElementRepository.findUniqByUserId(userId);

  const knowledgeElementsBeforeSharedDate = allKnowledgeElements
    .filter((ke) => _createdBeforeLimitDate(ke.createdAt,assessment.campaignParticipation.sharedAt));

  return new SkillReview({
    id: skillReviewId,
    targetedSkills: assessment.targetProfile.skills,
    knowledgeElements: knowledgeElementsBeforeSharedDate,
    computeUnratableSkill: assessment.isCompleted
  });

};

function _createdBeforeLimitDate(dateToVerify, limitDate) {
  if(limitDate) {
    return moment(dateToVerify).format('YYYY-MM-DD HH:mm:ss') <= moment(limitDate).format('YYYY-MM-DD HH:mm:ss');
  }
  return true;
}
