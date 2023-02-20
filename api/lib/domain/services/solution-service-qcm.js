import _ from '../../infrastructure/utils/lodash-utils';
import AnswerStatus from '../models/AnswerStatus';

export default {
  match(answer, solution) {
    if (_.areCSVequivalent(answer, solution)) {
      return AnswerStatus.OK;
    }
    return AnswerStatus.KO;
  },
};
