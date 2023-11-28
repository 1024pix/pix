import { Factory } from 'miragejs';

export default Factory.extend({
  nbChallenges() {
    return 8;
  },

  sessionId() {
    return 314159;
  },

  accessCode() {
    return 314159265;
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
