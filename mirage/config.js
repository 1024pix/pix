import _ from 'lodash';

function pickChallengesAtRandom(schema, nbOfChallenges) {
  return _.range(1, nbOfChallenges).map((number) => {
    const challenges = schema.challenges.where({ number }).models;
    const randomIndex = _.random(0, (challenges.length - 1));
    const challenge = challenges[randomIndex];
    return challenge.id;
  });
}

export default function () {

  this.get('/courses');
  this.get('/courses/:id');
  this.post('/assessments', function (schema) {
    const payload = this.normalizedRequestAttrs();
    const challengeIds = pickChallengesAtRandom(schema, 5);
    return schema.assessments.create({ course: schema.courses.find(payload.course), challengeIds });
  });
  this.get('/assessments/:id');
  this.get('/assessments/:id/challenges', function (schema, request) {
    return schema.challenges.where({ assessmentId: request.params.id });
  });
  this.get('/challenges/:id');

  this.passthrough('https://api.airtable.com/**');

}
