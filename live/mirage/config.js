import getChallenge from './routes/get-challenge';
import getChallenges from './routes/get-challenges';
import getNextChallenge from './routes/get-next-challenge';
import getAssessmentSolutions from './routes/get-assessment-solutions';
import getCourse from './routes/get-course';
import getCourses from './routes/get-courses';
import getCoursesOfTheWeek from './routes/get-courses-of-the-week';
import getAnswer from './routes/get-answer';
import postAnswers from './routes/post-answers';
import patchAnswer from './routes/patch-answer';
import getAssessment from './routes/get-assessment';
import postAssessments from './routes/post-assessments';
import getAnswerByChallengeAndAssessment from './routes/get-answer-by-challenge-and-assessment';
import postFeedbacks from './routes/post-feedbacks';
import postRefreshSolution from './routes/post-refresh-solution';
import postAuthentications from './routes/post-authentications';
import getAuthenticatedUser from './routes/get-user-me';
import getOrganizations from './routes/get-organizations';
import getSnapshots from './routes/get-snapshots';

import { Response } from 'ember-cli-mirage';

export default function() {
  this.logging = false;
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

  this.post('/challenges/:challengeId/solution', postRefreshSolution);

  this.post('/assessments', postAssessments);
  this.get('/assessments/:id', getAssessment);
  this.get('/assessments/:assessmentId/next/:challengeId', getNextChallenge);
  this.get('/assessments/:assessmentId/next', getNextChallenge);
  this.get('/assessments/:assessmentId/solutions/:answerId', getAssessmentSolutions);

  this.post('/answers', postAnswers);
  this.get('/answers/:id', getAnswer);
  this.get('/answers', getAnswerByChallengeAndAssessment);
  this.patch('/answers/:id', patchAnswer);

  this.post('/feedbacks', postFeedbacks);

  //Nouveau Mirage

  // CourseGroups
  this.get('/course-groups');

  //Courses
  this.get('/courses/:id', getCourse);

  this.post('/authentications', postAuthentications);
  this.get('/users/me', getAuthenticatedUser);
  this.get('/competences/:id');
  this.get('/areas/:id');
  this.get('/organizations/:id');

  this.get('/organizations', getOrganizations);

  this.post('/snapshots');
  this.get('/snapshots/:id');
  this.get('/organizations/:id/snapshots', getSnapshots);

  this.post('/followers');
  this.post('/users');

  this.post('/password-reset-demands', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const sentEmail = attrs.data.attributes.email;
    const matchingAccount = schema.users.findBy({ email: sentEmail });

    if (matchingAccount != null) {
      return schema.passwordResetDemands.create({ email: sentEmail });
    } else {
      return new Response(400);
    }

  });
}
