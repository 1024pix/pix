import { association, Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  name() {
    return faker.company.companyName();
  },

  code() {
    return 'ABCDEF' + faker.random.number({ min: 100, max: 999 });
  },

  createdAt() {
    return faker.date.recent();
  },

  campaignReport: association(),

});

