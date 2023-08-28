import completeAssessment from './complete-assessment';
import getAssessment from './get-assessment';
import getNextChallenge from './get-next-challenge';
import pauseAssessment from './pause-assessment';
import postAssessments from './post-assessments';
import setFocusedOutState from './set-focusedout-state';

export default function index(config) {
  config.post('/assessments', postAssessments);

  config.get('/assessments/:id', getAssessment);

  config.get('/assessments/:id/next', getNextChallenge);

  config.patch('/assessments/:id/complete-assessment', completeAssessment);
  config.patch('/assessments/:id/last-challenge-state/focusedout', setFocusedOutState);
  config.post('/assessments/:id/alert', pauseAssessment);
}
