import { Factory } from 'miragejs';

export default Factory.extend({
  name() {
    return 'Nom de competence pas inspiré';
  },

  index() {
    return '1a';
  },

  totalSkillsCount() {
    return 27;
  },

  afterCreate(competenceResult) {
    if (!competenceResult.testedSkillsCount) {
      competenceResult.update({ testedSkillsCount: competenceResult.totalSkillsCounts - 1 });
    }
    if (!competenceResult.validatedSkillsCount) {
      competenceResult.update({ validatedSkillsCount: competenceResult.testedSkillsCount - 1 });
    }
  },
});
