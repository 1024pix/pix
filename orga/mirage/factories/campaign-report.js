import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  participationsCount() {
    return faker.random.number();
  },

  sharedParticipationsCount() {
    return faker.random.number();
  },
});
