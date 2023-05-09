import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  certificationCourseId() {
    return faker.datatype.number();
  },

  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  externalId() {
    return faker.datatype.uuid();
  },

  hasSeenEndTestScreen() {
    return faker.datatype.boolean();
  },

  isCompleted() {
    return faker.datatype.boolean();
  },

  abortReason() {
    return faker.random.word();
  },
});
