import completeAssessment from './complete-assessment';
import findAssessments from './find-assessments';
import getAssessment from './get-assessment';
import getNextChallenge from './get-next-challenge';
import postAssessments from './post-assessments';

export default function index(config) {
  config.post('/assessments', postAssessments);
  config.get('/assessments/:id', getAssessment);
  config.get('/assessments/:assessmentId/next', getNextChallenge);
  config.get('/assessments/:assessmentId/next?tryImproving', getNextChallenge);
  config.get('/assessments', findAssessments);
  config.patch('/assessments/:id/complete-assessment', completeAssessment);
}
