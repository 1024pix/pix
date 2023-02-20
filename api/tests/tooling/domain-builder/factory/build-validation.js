import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import Validation from '../../../../lib/domain/models/Validation';

export default function ({ result = AnswerStatus.OK, resultDetails = 'Bravo' } = {}) {
  return new Validation({
    result,
    resultDetails,
  });
}
