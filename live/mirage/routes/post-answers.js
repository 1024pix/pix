import qcmChallenge from '../data/challenges/qcm-challenge';
import qcuChallenge from '../data/challenges/qcu-challenge';
import qcuChallengeWithImage from '../data/challenges/qcu-challenge-with-image';
import qrocmChallenge from '../data/challenges/qrocm-challenge';

import qcmAnswer from '../data/answers/qcm-answer';
import qcuAnswer from '../data/answers/qcu-answer';
import qcuAnswerWithImage from '../data/answers/qcu-answer-with-image';
import qrocmAnswer from '../data/answers/qrocm-answer';

export default function (schema, request) {

  const answer = JSON.parse(request.requestBody);

  switch (answer.data.relationships.challenge.data.id) {

    case qcmChallenge.data.id:
      return qcmAnswer;
    case qcuChallenge.data.id:
      return qcuAnswer;
    case qcuChallengeWithImage.data.id:
      return qcuAnswerWithImage;
    case qrocmChallenge.data.id:
      return qrocmAnswer;
    default:
      throw new Error();
  }

}
