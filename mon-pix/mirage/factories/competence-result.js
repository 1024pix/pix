import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  name() {
    return faker.lorem.words();
  },

  index() {
    return faker.string.alphanumeric(2);
  },

  totalSkillsCount() {
    return faker.number.int() + 3;
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
