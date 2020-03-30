import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'totalSkillsCount',
    'testedSkillsCount',
    'validatedSkillsCount',
    'masteryPercentage',
    'isCompleted',
    'areBadgeCriteriaFulfilled',
  ],
  include: [
    'badge',
    'partnerCompetenceResults',
    'competenceResults',
  ],
});
