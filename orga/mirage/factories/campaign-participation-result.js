import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  totalSkillsCount() {
    return 100;
  },

  testedSkillsCount() {
    return Math.floor(Math.random() * this.totalSkillsCount);
  },

  validatedSkillsCount() {
    return Math.floor(Math.random() * this.testedSkillsCount);
  },

  isCompleted() {
    return faker.random.boolean();
  },
});
