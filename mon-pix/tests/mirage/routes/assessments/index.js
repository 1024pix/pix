import completeAssessment from './complete-assessment';
import getAssessment from './get-assessment';
import pauseAssessment from './pause-assessment';
import postAssessments from './post-assessments';
import setFocusedOutState from './set-focusedout-state';

export default function index(config) {
  config.post('/assessments', postAssessments);

  config.get('/assessments/:id', getAssessment);

  config.patch('/assessments/:id/complete-assessment', completeAssessment);
  config.patch('/assessments/:id/last-challenge-state/focusedout', setFocusedOutState);
  config.post('/assessments/:id/alert', pauseAssessment);
}
