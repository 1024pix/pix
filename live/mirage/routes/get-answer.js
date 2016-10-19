import qcuAnswer from '../data/answers/qcu-answer';
import qcmAnswer from '../data/answers/qcm-answer';
import qrocmAnswer from '../data/answers/qrocm-answer';

export default function (schema, request) {

  switch (request.params.id) {

    case qcmAnswer.data.id:
      return qcmAnswer;
    case qcuAnswer.data.id:
      return qcuAnswer;
    case qrocmAnswer.data.id:
      return qrocmAnswer;
    default:
      throw new Error();
  }

}
