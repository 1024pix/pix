import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  nbChallenges() {
    return faker.number.int();
  },

  sessionId() {
    return faker.number.int();
  },

  accessCode() {
    return faker.string.alphanumeric(9);
  },

  afterCreate(certificationCourse, server) {
    if (!certificationCourse.assessment) {
      certificationCourse.update({
        assessment: server.create('assessment', {
          type: 'CERTIFICATION',
          certificationNumber: certificationCourse.id,
          certificationCourse,
        }),
      });
    }
  },
});
