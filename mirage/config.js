import _ from 'lodash';

function pickChallengesAtRandom(schema, howMany = 5) {

  return _.range(1, howMany).map((number) => {

    const challenges = schema.challenges.where({ number }).models;
    const randomIdx = _.random(0, (challenges.length - 1));

    return challenges[randomIdx];
  });
}


export default function () {

  this.urlPrefix = 'http://localhost:4200';
  this.namespace = 'api/live';

  this.get('/courses');
  this.get('/courses/:id');
  this.post('/assessments', function(schema) {
    const attrs = this.normalizedRequestAttrs();

    const challengeIds = pickChallengesAtRandom(schema, 5);
    return schema.assessments.create({ course: schema.courses.find(attrs.course), challengeIds });
  });
  this.get('/assessments/:id');
  this.get('/assessments/:id/challenges', function(schema, request) {
    return schema.challenges.where({ assessmentId: request.params.id });
  });
  this.get('/challenges/:id');
}
