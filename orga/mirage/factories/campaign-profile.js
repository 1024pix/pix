import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  firstName() {
    return faker.name.firstName();
  },

  lastName() {
    return faker.name.lastName();
  },

  externalId() {
    return faker.name.jobTitle();
  },

  organizationLearnerId() {
    return 1;
  },

  createdAt() {
    return faker.date.past();
  },

  sharedAt() {
    return faker.date.recent();
  },

  pixScore() {
    return 8;
  },

  certifiableCompetencesCount() {
    return 1;
  },

  competencesCount() {
    return 12;
  },

  isCertifiable() {
    return true;
  },

  isShared() {
    return true;
  },
});
