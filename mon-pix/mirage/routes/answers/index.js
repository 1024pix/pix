import postAnswers from './post-answers';
import getAnswer from './get-answer';
import getAnswerCorrection from './get-answer-correction';
import getAnswerByChallengeAndAssessment from './get-answer-by-challenge-and-assessment';
//import patchAnswer from './patch-answer';

export default function index(config) {
  config.post('/answers', postAnswers);
  config.get('/answers/:id', getAnswer);
  config.get('/answers/:id/correction', getAnswerCorrection);
  config.get('/answers', getAnswerByChallengeAndAssessment);
  //config.patch('/answers/:id', patchAnswer);
}
