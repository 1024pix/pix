import _ from 'pix-live/utils/lodash-custom';

import refQcmChallengeFull from '../data/challenges/ref-qcm-challenge';
import refQcuChallengeFull from '../data/challenges/ref-qcu-challenge';
import refQruChallengeFull from '../data/challenges/ref-qru-challenge';
import refQrocChallengeFull from '../data/challenges/ref-qroc-challenge';
import refQrocmChallengeFull from '../data/challenges/ref-qrocm-challenge';

// answers
import refQcuAnswer from '../data/answers/ref-qcu-answer';
import refQruAnswer from '../data/answers/ref-qru-answer';
import refQcmAnswer from '../data/answers/ref-qcm-answer';
import refQrocAnswer from '../data/answers/ref-qroc-answer';
import refQrocmAnswer from '../data/answers/ref-qrocm-answer';

export default function (schema, request) {

  const answer = JSON.parse(request.requestBody);
  const challengeId = answer.data.relationships.challenge.data.id;

  const allChallenges = [
    refQcmChallengeFull,
    refQcuChallengeFull,
    refQruChallengeFull,
    refQrocChallengeFull,
    refQrocmChallengeFull
  ];

  const allAnswers = [
    refQcmAnswer,
    refQcuAnswer,
    refQruAnswer,
    refQrocAnswer,
    refQrocmAnswer
  ];

  const answers = _.map(allChallenges, function (oneChallenge, index) {
    return { id: oneChallenge.data.id, obj: allAnswers[index] };
  });

  const finalAnswer = _.find(answers, { id: challengeId });

  if (finalAnswer) {
    return finalAnswer.obj;
  } else {
    throw new Error('Unable to POST this answer in the stub, sorry');
  }

}
