import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import service from '../../../../../src/devcomp/domain/services/solution-service-qcm.js';

describe('Unit | Devcomp | Domain | Services | SolutionServiceQCM ', function () {
  describe('if solution type is QCM', function () {
    const successfulCases = [
      { answerValues: ['1'], solutionValues: ['1'] },
      { answerValues: ['1', '2'], solutionValues: ['1', '2'] },
      { answerValues: ['1', '2', '3'], solutionValues: ['1', '2', '3'] },
      { answerValues: ['1', '2', '3'], solutionValues: ['1', '2', '3'] },
      { answerValues: ['3', '2', '1'], solutionValues: ['1', '2', '3'] },
      { answerValues: ['1', '2', '3'], solutionValues: ['1', '2', '3'] },
      { answerValues: ['1', '2', '3'], solutionValues: ['1', '2', '3'] },
      { answerValues: ['1', '2', '3'], solutionValues: ['1', '2', '3'] },
    ];

    successfulCases.forEach(({ answerValues, solutionValues }) => {
      it(
        'should return "ok" when answer is "' +
          JSON.stringify(answerValues) +
          '" and solution is "' +
          JSON.stringify(solutionValues) +
          '"',
        function () {
          const result = service.match(answerValues, solutionValues);
          expect(AnswerStatus.isOK(result)).to.be.true;
        },
      );
    });

    const failedCases = [
      { answerValues: ['2'], solutionValues: ['1'] },
      { answerValues: ['1', '3'], solutionValues: ['1', '2'] },
      { answerValues: ['1', '2', '3'], solutionValues: ['1', '2'] },
      { answerValues: ['3', '1'], solutionValues: ['1', '2'] },
    ];

    failedCases.forEach(({ answerValues, solutionValues }) => {
      it(
        'should return "ko" when answer is "' +
          JSON.stringify(answerValues) +
          '" and solution is "' +
          JSON.stringify(solutionValues) +
          '"',
        function () {
          const result = service.match(answerValues, solutionValues);
          expect(AnswerStatus.isKO(result)).to.be.true;
        },
      );
    });
  });
});
