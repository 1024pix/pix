import getAnswer from './routes/get-answer';
import getAnswerByChallengeAndAssessment from './routes/get-answer-by-challenge-and-assessment';
import getAssessment from './routes/get-assessment';
import getAuthenticatedUser from './routes/get-user-me';
import getChallenge from './routes/get-challenge';
import getChallenges from './routes/get-challenges';
import getCourse from './routes/get-course';
import getCourses from './routes/get-courses';
import getCoursesOfTheWeek from './routes/get-courses-of-the-week';
import getNextChallenge from './routes/get-next-challenge';
import getOrganizations from './routes/get-organizations';
import getSnapshots from './routes/get-snapshots';
import getCorrections from './routes/get-corrections';
import patchAnswer from './routes/patch-answer';
import postAnswers from './routes/post-answers';
import postAssessments from './routes/post-assessments';
import postAuthentications from './routes/post-authentications';
import postCertificationCourse from './routes/post-certification-course';
import postFeedbacks from './routes/post-feedbacks';

import { Response } from 'ember-cli-mirage';

/* eslint max-statements: off */
export default function() {
  this.logging = true;
  this.passthrough('/write-coverage');
  this.post('https://fonts.googleapis.com/**', () => {
  });

  this.urlPrefix = 'http://localhost:3000';
  this.namespace = '/api';
  this.timing = 0; // response delay

  this.get('/courses', getCourses);
  this.get('/courses?isCourseOfTheWeek=true', getCoursesOfTheWeek);

  this.get('/challenges', getChallenges);
  this.get('/challenges/:id', getChallenge);

  this.post('/assessments', postAssessments);
  this.get('/assessments');
  this.get('/assessments/:id', getAssessment);
  this.get('/assessments/:assessmentId/next/:challengeId', getNextChallenge);
  this.get('/assessments/:assessmentId/next', getNextChallenge);

  this.post('/answers', postAnswers);
  this.get('/answers/:id', getAnswer);
  this.get('/answers', getAnswerByChallengeAndAssessment);
  this.patch('/answers/:id', patchAnswer);

  this.post('/feedbacks', postFeedbacks);

  //Nouveau Mirage

  //Courses
  this.get('/courses/:id', getCourse);
  this.post('/courses', postCertificationCourse);

  this.get('/certifications');

  this.post('/authentications', postAuthentications);
  this.get('/users/me', getAuthenticatedUser);
  this.get('/competences/:id');
  this.get('/areas/:id');
  this.get('/organizations/:id');

  this.get('/organizations', getOrganizations);

  this.get('/corrections', getCorrections);

  this.post('/snapshots');
  this.get('/snapshots/:id');
  this.get('/organizations/:id/snapshots', getSnapshots);

  this.post('/users');
  this.post('/assessment-results');

  this.del('/cache', () => null, 204);

  this.post('/password-reset-demands', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const sentEmail = attrs.data.attributes.email;
    const matchingAccount = schema.users.findBy({ email: sentEmail });

    if (matchingAccount !== null) {
      return schema.passwordResetDemands.create({ email: sentEmail });
    } else {
      return new Response(400);
    }
  });

  this.get('/skill-reviews/:id');
}
