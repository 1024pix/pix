import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  certificationCenter() {
    return faker.company.companyName();
  },

  accessCode() {
    return 'ABCDEF' + faker.random.number({min: 100, max: 999});
  },

  createdAt() {
    return faker.date.recent();
  },

});
