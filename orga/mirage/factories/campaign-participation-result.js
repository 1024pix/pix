import { Factory, faker } from 'ember-cli-mirage';

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
