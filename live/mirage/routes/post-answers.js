import _ from 'pix-live/utils/lodash-custom';

import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQruChallengeFull from '../data/challenges/ref-qru-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';
import refTimedChallenge from '../data/challenges/ref-timed-challenge';
import refTimedChallengeBis from '../data/challenges/ref-timed-challenge-bis';

// answers
import refQcuAnswer from '../data/answers/ref-qcu-answer';
import refQruAnswer from '../data/answers/ref-qru-answer';
import refQcmAnswer from '../data/answers/ref-qcm-answer';
import refQrocAnswer from '../data/answers/ref-qroc-answer';
import refQrocmAnswer from '../data/answers/ref-qrocm-answer';
import refTimedAnswer from '../data/answers/ref-timed-answer';
import refTimedAnswerBis from '../data/answers/ref-timed-answer-bis';

export default function(schema, request) {

  const answer = JSON.parse(request.requestBody);
  const challengeId = answer.data.relationships.challenge.data.id;

  const allChallenges = [
    refQcmChallengeFull,
    refQcuChallengeFull,
    refQruChallengeFull,
    refQrocChallengeFull,
    refQrocmChallengeFull,
    refTimedChallenge,
    refTimedChallengeBis
  ];

  const allAnswers = [
    refQcmAnswer,
    refQcuAnswer,
    refQruAnswer,
    refQrocAnswer,
    refQrocmAnswer,
    refTimedAnswer,
    refTimedAnswerBis
  ];

  const answers = _.map(allChallenges, function(oneChallenge, index) {
    return { id: oneChallenge.data.id, obj: allAnswers[index] };
  });

  const finalAnswer = _.find(answers, { id: challengeId });

  if (finalAnswer) {
    return finalAnswer.obj;
  }else {
    throw new Error('Unable to POST this answer in the stub, sorry');
  }

}
