import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  participationsCount() {
    return faker.random.number();
  },

  sharedParticipationsCount() {
    return faker.random.number();
  },
});
