import { expect } from '../../../test-helper';
import service from '../../../../lib/domain/services/solution-service-qcm';
import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';

describe('Unit | Service | SolutionServiceQCM ', function () {
  describe('if solution type is QCM', function () {
    const successfulCases = [
      { answerValue: '1', solutionValue: '1' },
      { answerValue: '1, 2', solutionValue: '1, 2' },
      { answerValue: '1, 2, 3', solutionValue: '1, 2, 3' },
      { answerValue: '1,2,3', solutionValue: '1,2,3' },
      { answerValue: '3, 2, 1', solutionValue: '1, 2, 3' },
      { answerValue: '1,2,3', solutionValue: '1, 2, 3' },
      { answerValue: '1,   2,   3   ', solutionValue: '1, 2, 3' },
      { answerValue: '1, 2, 3', solutionValue: '1, 2, 3' },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    successfulCases.forEach(({ answerValue, solutionValue }) => {
      it(
        'should return "ok" when answer is "' + answerValue + '" and solution is "' + solutionValue + '"',
        function () {
          const result = service.match(answerValue, solutionValue);
          expect(AnswerStatus.isOK(result)).to.be.true;
        }
      );
    });

    const failedCases = [
      { answerValue: '2', solutionValue: '1' },
      { answerValue: '1, 3', solutionValue: '1, 2' },
      { answerValue: '1, 2, 3', solutionValue: '1, 2' },
      { answerValue: '3, 1', solutionValue: '1, 2' },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    failedCases.forEach(({ answerValue, solutionValue }) => {
      it(
        'should return "ko" when answer is "' + answerValue + '" and solution is "' + solutionValue + '"',
        function () {
          const result = service.match(answerValue, solutionValue);
          expect(AnswerStatus.isKO(result)).to.be.true;
        }
      );
    });
  });
});
