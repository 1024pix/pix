import _ from 'lodash';

function progress(campaignParticipationCompleted, numberOfKnowledgeElements, numberOfSkillsInTargetProfile) {
  if (campaignParticipationCompleted) {
    return 1;
  }
  return _.round(numberOfKnowledgeElements / numberOfSkillsInTargetProfile, 3);
}

export default {
  progress,
};
