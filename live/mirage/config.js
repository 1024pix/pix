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
import postFollowers from './routes/post-followers';
import postFeedbacks from './routes/post-feedbacks';
import postRefreshSolution from './routes/post-refresh-solution';
import postUsers from './routes/post-users';
import postAuthentications from './routes/post-authentications';

export default function() {
  this.logging = false;
  this.passthrough('/write-coverage');
  this.post('https://fonts.googleapis.com/**', () => {});
  this.post('https://formspree.io/**', () => {});
  this.post('https://sentry.io/**', () => {});

  this.urlPrefix = 'http://localhost:3000';
  this.namespace = '/api';
  this.timing = 0; // response delay

  this.get('/courses', getCourses);
  this.get('/courses?isCourseOfTheWeek=true', getCoursesOfTheWeek);
  this.get('/courses/:id', getCourse);

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

  this.post('/followers', postFollowers);

  this.post('/users', postUsers);
  this.post('/authentications', postAuthentications);
}
