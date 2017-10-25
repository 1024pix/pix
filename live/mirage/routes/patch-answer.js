import _ from 'pix-live/utils/lodash-custom';

import refQcuAnswer from '../data/answers/ref-qcu-answer';
import refQcmAnswer from '../data/answers/ref-qcm-answer';
import refQrocAnswer from '../data/answers/ref-qroc-answer';
import refQrocmAnswer from '../data/answers/ref-qrocm-answer';
import refTimedAnswer from '../data/answers/ref-timed-answer';
import refTimedAnswerBis from '../data/answers/ref-timed-answer-bis';

export default function(schema, request) {

  const receivedAnswer = JSON.parse(request.requestBody);

  const allAnswers = [
    refQcmAnswer,
    refQcuAnswer,
    refQrocAnswer,
    refQrocmAnswer,
    refTimedAnswer,
    refTimedAnswerBis
  ];
  const existingAnswer = _.find(allAnswers, function(answer) {
    return answer.data.id === receivedAnswer.data.id;
  });
  if (!existingAnswer) {
    throw new Error('Unable to PATCH this answer: no answer with id `' + receivedAnswer.data.id + '` found in the stubs.');
  }

  const updatedAnswer = existingAnswer;
  Object.assign(updatedAnswer.data.attributes, receivedAnswer.data.attributes);
  return updatedAnswer;
}
