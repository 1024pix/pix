import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  certificationCourseId() {
    return faker.random.number();
  },

  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  externalId() {
    return faker.random.uuid();
  },

  hasSeenEndTestScreen() {
    return faker.random.boolean();
  },
});
