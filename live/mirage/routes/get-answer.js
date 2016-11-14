import _                  from 'lodash/lodash';
import qcmAnswerAband     from '../data/answers/qcu-answer-aband';
import qcuAnswer          from '../data/answers/qcu-answer';
import qcuAnswerWithImage from '../data/answers/qcu-answer-with-image';
import qrocmAnswer        from '../data/answers/qrocm-answer';
import qcmAnswer          from '../data/answers/qcm-answer';
import qcmAnswerKo        from '../data/answers/qcm-answer-ko';
import qcmAnswerOk        from '../data/answers/qcm-answer-ok';
import qrocAnswerKo       from '../data/answers/qroc-answer-ko';
import qrocAnswer         from '../data/answers/qroc-answer';
import qrocAnswerOk       from '../data/answers/qroc-answer-ok';


export default function (schema, request) {

  const allAnswers = [
    qcuAnswer,
    qcuAnswerWithImage,
    qcmAnswer,
    qrocmAnswer,
    qcmAnswerKo,
    qcmAnswerOk,
    qcmAnswerAband,
    qrocAnswerKo,
    qrocAnswer,
    qrocAnswerOk
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
