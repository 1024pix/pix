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
import getAuthenticatedUser from './routes/get-user-me';

export default function() {
  this.logging = false;
  this.passthrough('/write-coverage');
  this.post('https://fonts.googleapis.com/**', () => {
  });
  this.post('https://formspree.io/**', () => {
  });
  this.post('https://sentry.io/**', () => {
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

  this.post('/followers', postFollowers);

  this.post('/users', postUsers);

  //Nouveau Mirage

  //CourseGroups
  this.get('/course-groups');

  //Courses
  this.get('/courses/:id', (schema, request) => {

    const id = request.params.id;
    if (['ref_course_id', 'highligthed_course_id', 'ref_timed_challenge_course_id'].includes(id)) {
      return getCourse(schema, request);
    }
    return schema.courses.find(id);
  });

  this.post('/authentications', postAuthentications);
  this.get('/users/me', getAuthenticatedUser);
  this.get('/competences/:id');
  this.get('/areas/:id');
  this.get('/organizations/:id');

  this.get('/organizations', (schema, request) => {

    const code = request.queryParams['filter[code]'];

    if (code) {
      return schema.organizations.where({ code });
    }

    return schema.organizations.all();
  });

  this.post('/snapshots');
  this.get('/organizations/:id/snapshots', (schema, request) => {
    const organizationId = request.params.id;

    return schema.snapshots.where({ organizationId: organizationId });
  });
}
