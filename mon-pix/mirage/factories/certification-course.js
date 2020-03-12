import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

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
    certificationCourse.update({
      assessment: server.create('assessment', { type: 'CERTIFICATION', certificationNumber: certificationCourse.id, certificationCourse }),
    });
  },

});
