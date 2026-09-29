import _ from 'lodash';

function progress(campaignParticipationCompleted, numberOfAssessedSkills, numberOfSkillsInTargetProfile) {
  if (campaignParticipationCompleted) {
    return 1;
  }
  return _.round(numberOfAssessedSkills / numberOfSkillsInTargetProfile, 3);
}

export { progress };
