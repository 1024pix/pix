import { Factory } from 'miragejs';
import faker from '@faker-js/faker';

export default Factory.extend({
  nbChallenges() {
    return faker.random.number();
  },

  sessionId() {
    return faker.random.number();
  },

  accessCode() {
    return faker.random.alphaNumeric(9);
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
