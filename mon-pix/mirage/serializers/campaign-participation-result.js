import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'totalSkillsCount',
    'testedSkillsCount',
    'validatedSkillsCount',
    'masteryPercentage',
    'isCompleted',
    'stageCount',
  ],
  include: [
    'campaignParticipationBadges',
    'competenceResults',
    'reachedStage',
  ],
});
