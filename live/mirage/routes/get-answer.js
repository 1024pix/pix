import _ from 'lodash/lodash';
import rawQcmAnswer from '../data/answers/raw-qcm-answer';
import refQcmAnswer from '../data/answers/ref-qcm-answer';
import refQcuAnswer from '../data/answers/ref-qcu-answer';
import refQruAnswer from '../data/answers/ref-qru-answer';
import refQrocAnswer from '../data/answers/ref-qroc-answer';
import refQrocmAnswer from '../data/answers/ref-qrocm-answer';

export default function (schema, request) {

  const allAnswers = [
    rawQcmAnswer,
    refQcuAnswer,
    refQruAnswer,
    refQcmAnswer,
    refQrocAnswer,
    refQrocmAnswer
  ];

  const answers = _.map(allAnswers, function (oneAnswer) {
    return { id: oneAnswer.data.id, obj: oneAnswer };
  });

  const answer = _.find(answers, { id: request.params.id });

  if (answer) {
    return answer.obj;
  } else {
    throw new Error({message:'404 The answer you required in the fake server does not exist ' + request.params.id});
  }

}
