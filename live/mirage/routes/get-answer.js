import qcuAnswer from '../data/answers/qcu-answer';
import qcuAnswerWithImage from '../data/answers/qcu-answer-with-image';
import qcmAnswer from '../data/answers/qcm-answer';
import qrocmAnswer from '../data/answers/qrocm-answer';
import qcmAnswerKo from '../data/answers/qcm-answer-ko';
import qcmAnswerOk from '../data/answers/qcm-answer-ok';

export default function (schema, request) {

  const answers = {
    'qcm_answer_id': qcmAnswer,
    'qcu_answer_with_image_id': qcuAnswerWithImage,
    'qcu_answer_id': qcuAnswer,
    'qrocm_answer_id': qrocmAnswer,
    'qcm_answer_ko_id': qcmAnswerKo,
    'qcm_answer_ok_id': qcmAnswerOk
  };

  const answer = answers[request.params.id];

  if (answer) {
    return answer;
  } else {
    throw new Error('The answer you required in the fake server does not exist');
  }


}
