import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  name() {
    return faker.random.words();
  },

  index() {
    return faker.random.alphaNumeric(2);
  },

  totalSkillsCount() {
    return faker.random.number() + 3;
  },

  afterCreate(competenceResult) {
    if (!competenceResult.testedSkillsCount) {
      competenceResult.update({ testedSkillsCount : competenceResult.totalSkillsCounts - 1 });
    }
    if (!competenceResult.validatedSkillsCount) {
      competenceResult.update({ validatedSkillsCount : competenceResult.testedSkillsCount - 1 });
    }
  },
});
