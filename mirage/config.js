import _ from 'lodash';

export default function () {

  this.urlPrefix = 'http://localhost:4200';
  this.namespace = 'api/live';

  this.get('/courses');
  this.get('/courses/:id');
  this.post('/assessments', function(schema) {
    const attrs = this.normalizedRequestAttrs();
    // five challenges at random
    const challengeIds = _.times(5, (number) => {

      let challenges = schema.challenges.where({ number: number + 1 }).models;
      var random_element = _.random(0, challenges.length - 1);

      return challenges[random_element].id;
    });

    return schema.assessments.create({ course: schema.courses.find(attrs.course), challengeIds });
  });
  this.get('/assessments/:id');
  this.get('/assessments/:id/challenges', function(schema, request) {
    return schema.challenges.where({ assessmentId: request.params.id });
  });
  this.get('/challenges/:id');
}
