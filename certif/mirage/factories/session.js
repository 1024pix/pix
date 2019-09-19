import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  examiner() {
    return faker.company.companyName();
  },

  accessCode() {
    return 'ABCDEF' + faker.random.number({ min: 100, max: 999 });
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
