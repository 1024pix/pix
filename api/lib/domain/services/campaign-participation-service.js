const _ = require('lodash');

function progress(campaignParticipationCompleted, numberOfKnowledgeElements, numberOfSkillsInTargetProfile) {
  if (campaignParticipationCompleted) {
    return 1;
  }
  return _.round(numberOfKnowledgeElements / numberOfSkillsInTargetProfile, 3);
}

module.exports = {
  progress,
};
