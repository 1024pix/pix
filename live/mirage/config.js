import getChallenge                      from './routes/get-challenge';
import getChallenges                     from './routes/get-challenges';
import getCourse                         from './routes/get-course';
import getCourses                        from './routes/get-courses';
import getAnswer                         from './routes/get-answer';
import postAnswers                       from './routes/post-answers';
import getAssessment                     from './routes/get-assessment';
import postAssessments                   from './routes/post-assessments';
import getAnswerByChallengeAndAssessment from './routes/get-answer-by-challenge-and-assessment';

export default function () {

  this.passthrough('/write-coverage');
  this.passthrough('https://formspree.io/**');
  this.post('https://sentry.io/**', () => {});

  this.namespace = 'http://localhost:3000/api';

  this.get('/courses',         getCourses);
  this.get('/courses/:id',     getCourse);

  this.get('/challenges',      getChallenges);
  this.get('/challenges/:id',  getChallenge);

  this.post('/assessments',    postAssessments);
  this.get('/assessments/:id', getAssessment);

  this.post('/answers',        postAnswers);
  this.get('/answers/:id',     getAnswer);
  this.get ('/answers',        getAnswerByChallengeAndAssessment);

}
