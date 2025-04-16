import getAnswer from './get-answer';
import getAnswerByChallengeAndAssessment from './get-answer-by-challenge-and-assessment';
import getAnswerCorrection from './get-answer-correction';
import postAnswers from './post-answers';

export default function index(config) {
  config.get('/answers', getAnswerByChallengeAndAssessment);
  config.post('/answers', postAnswers);

  config.get('/answers/:id', getAnswer);

  config.get('/answers/:id/correction', getAnswerCorrection);
}
