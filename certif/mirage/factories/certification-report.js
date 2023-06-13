import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  certificationCourseId() {
    return faker.number.int();
  },

  firstName() {
    return faker.person.firstName();
  },

  lastName() {
    return faker.person.lastName();
  },

  externalId() {
    return faker.string.uuid();
  },

  hasSeenEndTestScreen() {
    return faker.datatype.boolean();
  },

  isCompleted() {
    return faker.datatype.boolean();
  },

  abortReason() {
    return faker.lorem.word();
  },
});
