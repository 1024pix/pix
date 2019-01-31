import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({

  certificationCenter() {
    return faker.company.companyName();
  },

  examiner() {
    return faker.company.companyName();
  },

  accessCode() {
    return 'ABCDEF' + faker.random.number({min: 100, max: 999});
  },

  date() {
    return '23/02/2019';
  },

  time() {
    return '14:00';
  },

  createdAt() {
    return faker.date.recent();
  },

});
