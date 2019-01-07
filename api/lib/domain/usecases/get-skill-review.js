const _ = require('lodash');
const moment = require('moment');
const SkillReview = require('../../../lib/domain/models/SkillReview');
const { UserNotAuthorizedToAccessEntity } = require('../../../lib/domain/errors');

module.exports = function getSkillReview(
  {
    skillReviewId,
    userId,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository
  }) {

  const assessmentId = SkillReview.getAssessmentIdFromId(skillReviewId);

  return Promise.all([
    smartPlacementAssessmentRepository.get(assessmentId),
    smartPlacementKnowledgeElementRepository.findByUserId(userId)
  ])
    .then(([assessment, knowledgeElements]) => {
      assessment.knowledgeElements = _(knowledgeElements)
        .filter((ke) => _createdBeforeLimitDate(ke.createdAt,assessment.campaignParticipation.sharedAt))
        .orderBy('createdAt', 'desc')
        .uniqBy('skillId')
        .value();

      if(`${assessment.userId}` !== `${userId}`) {
        throw new UserNotAuthorizedToAccessEntity();
      }

      return assessment.generateSkillReview();
    });
};

function _createdBeforeLimitDate(dateToVerify, limitDate) {
  if(limitDate) {
    return moment(dateToVerify).format('YYYY-MM-DD HH:mm:ss') <= moment(limitDate).format('YYYY-MM-DD HH:mm:ss');
  }
  return true;
}
