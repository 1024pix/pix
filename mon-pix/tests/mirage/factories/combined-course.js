import { Factory } from 'miragejs';

export default Factory.extend({
  afterCreate(combinedCourse, server) {
    server.create('verified-code', {
      id: combinedCourse.code,
      type: 'combined-course',
      combinedCourse,
    });
  },
});
