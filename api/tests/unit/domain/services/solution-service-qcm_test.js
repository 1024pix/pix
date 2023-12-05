import { expect } from '../../../test-helper.js';
import * as service from '../../../../lib/domain/services/solution-service-qcm.js';
import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';

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

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    successfulCases.forEach(({ answerValue, solutionValue }) => {
      it(
        'should return "ok" when answer is "' + answerValue + '" and solution is "' + solutionValue + '"',
        function () {
          const result = service.match(answerValue, solutionValue);
          expect(AnswerStatus.isOK(result)).to.be.true;
        },
      );
    });

    const failedCases = [
      { answerValue: '2', solutionValue: '1' },
      { answerValue: '1, 3', solutionValue: '1, 2' },
      { answerValue: '1, 2, 3', solutionValue: '1, 2' },
      { answerValue: '3, 1', solutionValue: '1, 2' },
    ];

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    failedCases.forEach(({ answerValue, solutionValue }) => {
      it(
        'should return "ko" when answer is "' + answerValue + '" and solution is "' + solutionValue + '"',
        function () {
          const result = service.match(answerValue, solutionValue);
          expect(AnswerStatus.isKO(result)).to.be.true;
        },
      );
    });
  });
});
