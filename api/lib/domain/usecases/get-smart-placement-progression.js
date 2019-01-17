const moment = require('moment');
const SmartPlacementProgression = require('../../../lib/domain/models/SmartPlacementProgression');
const { UserNotAuthorizedToAccessEntity } = require('../../../lib/domain/errors');

module.exports = async function getSmartPlacementProgression(
  {
    smartPlacementProgressionId,
    userId,
    smartPlacementAssessmentRepository,
    smartPlacementKnowledgeElementRepository
  }) {

  const assessmentId = SmartPlacementProgression.getAssessmentIdFromId(smartPlacementProgressionId);

  const assessment = await smartPlacementAssessmentRepository.get(assessmentId);
  if(assessment.userId != userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const allKnowledgeElements = await smartPlacementKnowledgeElementRepository.findUniqByUserId(userId);

  const knowledgeElementsBeforeSharedDate = allKnowledgeElements
    .filter((ke) => _createdBeforeLimitDate(ke.createdAt,assessment.campaignParticipation.sharedAt));

  return new SmartPlacementProgression({
    id: smartPlacementProgressionId,
    targetedSkills: assessment.targetProfile.skills,
    knowledgeElements: knowledgeElementsBeforeSharedDate,
    isProfileCompleted: assessment.isCompleted
  });

};

function _createdBeforeLimitDate(dateToVerify, limitDate) {
  if(limitDate) {
    return moment(dateToVerify).isBefore((limitDate));
  }
  return true;
}
