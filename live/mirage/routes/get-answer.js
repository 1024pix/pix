import _                  from 'lodash/lodash';
import qcmAnswerAband     from '../data/answers/qcu-answer-aband';
import qcuAnswer          from '../data/answers/qcu-answer';
import qcuAnswerWithImage from '../data/answers/qcu-answer-with-image';
import qcmAnswer          from '../data/answers/qcm-answer';
import qrocmAnswer        from '../data/answers/qrocm-answer';
import qcmAnswerKo        from '../data/answers/qcm-answer-ko';
import qcmAnswerOk        from '../data/answers/qcm-answer-ok';

export default function (schema, request) {

  const allAnswers = [
    qcuAnswer,
    qcuAnswerWithImage,
    qcmAnswer,
    qrocmAnswer,
    qcmAnswerKo,
    qcmAnswerOk,
    qcmAnswerAband
  ];

  const answers = _.map(allAnswers, function(oneAnswer) {
    return {id: oneAnswer.data.id, obj: oneAnswer}
  });

  const answer = _.find(answers, {id:request.params.id});

  if (answer) {
    return answer.obj;
  } else {
    throw new Error('The answer you required in the fake server does not exist ' + request.params.id);
  }


}
