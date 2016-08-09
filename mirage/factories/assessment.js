import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  afterCreate(assessment, server) {
    assessment.course = server.create('course');

    let challenges = server.createList('challenge', 5, { assessmentId: assessment.id });
    challenges.forEach((challenge, index) => {
      challenge.number = 1 + index;
      server.db.challenges.update(challenge.id, { number: challenge.number });
    });
    assessment.challenges = challenges;

    server.db.assessments.update(assessment.id, {
      courseId: assessment.course.id
    });
  }
});
