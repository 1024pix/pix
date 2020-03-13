import postAssessments from './post-assessments';
import getAssessment from './get-assessment';
import getNextChallenge from './get-next-challenge';
import findAssessments from './find-assessments';

export default function index(config) {
  config.post('/assessments', postAssessments);
  config.get('/assessments/:id', getAssessment);
  config.get('/assessments/:assessmentId/next', getNextChallenge);
  config.get('/assessments/:assessmentId/next?tryImproving', getNextChallenge);
  config.get('/assessments', findAssessments);
  config.patch('/assessments/:id/complete-assessment', getAssessment);
}
