import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'totalSkillsCount',
    'testedSkillsCount',
    'validatedSkillsCount',
    'isCompleted'
  ],
  include: ['badge', 'competenceResults'],
});
