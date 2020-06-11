import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'totalSkillsCount',
    'testedSkillsCount',
    'validatedSkillsCount',
    'masteryPercentage',
    'isCompleted',
  ],
  include: [
    'badges',
    'partnerCompetenceResults',
    'competenceResults',
  ],
});
