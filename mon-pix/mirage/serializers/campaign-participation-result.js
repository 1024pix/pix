import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'totalSkillsCount',
    'testedSkillsCount',
    'validatedSkillsCount',
    'masteryRate',
    'stageCount',
    'canRetry',
    'canImprove',
    'isShared',
    'participantExternalId',
  ],
  include: [
    'campaignParticipationBadges',
    'competenceResults',
    'reachedStage',
  ],
});
