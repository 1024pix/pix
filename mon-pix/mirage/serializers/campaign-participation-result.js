import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'totalSkillsCount',
    'testedSkillsCount',
    'validatedSkillsCount',
    'masteryRate',
    'canRetry',
    'canImprove',
    'isShared',
    'isDisabled',
    'participantExternalId',
  ],
  include: ['campaignParticipationBadges', 'competenceResults', 'reachedStage'],
});
