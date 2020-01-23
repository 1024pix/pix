import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({

  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  externalId() {
    return faker.random.uuid();
  },

  certificationCourseId() {
    return faker.random.number();
  },

  examinerComment() {
    if (faker.random.boolean()) {
      return faker.lorem.sentence();
    }

    return '';
  },

  hasSeenEndTestScreen() {
    return faker.random.boolean();
  },
});
