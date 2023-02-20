import AnswerStatus from '../models/AnswerStatus';

export default {
  match(answer, solution) {
    if (answer === solution) {
      return AnswerStatus.OK;
    }
    return AnswerStatus.KO;
  },
};
