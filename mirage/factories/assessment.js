import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(assessment, server) {
    assessment.course = server.create('course');

    let challenges = server.createList('challenge', 5, { assessmentId: assessment.id });
    challenges.forEach((c, idx) => {
      c.number = 1 + idx;
      server.db.challenges.update(c.id, { number: c.number });
    });
    assessment.challenges = challenges;

    server.db.assessments.update(assessment.id, {
      courseId: assessment.course.id
    });
  }
});
