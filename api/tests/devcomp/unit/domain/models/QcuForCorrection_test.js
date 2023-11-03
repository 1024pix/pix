import { expect, sinon } from '../../../../test-helper.js';
import { QCU } from '../../../../../src/devcomp/domain/models/element/QCU.js';
import { QcuCorrectionResponse } from '../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';

describe('Unit | Devcomp | Domain | Models | QcuForCorrection', function () {
  describe('#assess', function () {
    it('should return a QcuCorrectionResponse for a valid answer', function () {
      // given
      const assessResult = { result: { OK: 'ok' } };
      const givenAnswer = Symbol('givenAnswer');
      const qcuSolution = givenAnswer;

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: givenAnswer,
          },
        })
        .returns(assessResult);
      const qcu = new QCU({
        id: '',
        instruction: '',
        proposals: [{ id: givenAnswer }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solution: qcuSolution,
        validator,
      });

      const expectedResult = {
        globalResult: assessResult.result,
        feedback: qcu.feedbacks.valid,
        solutionId: qcuSolution,
      };

      // when
      const result = qcu.assess(givenAnswer);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(QcuCorrectionResponse);
    });

    it('should return a QcuCorrectionResponse for a invalid answer', function () {
      // given
      const assessResult = { result: { KO: 'ko' } };
      const givenAnswer = Symbol('givenAnswer');
      const qcuSolutionId = Symbol('qcuSolution');

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: givenAnswer,
          },
        })
        .returns(assessResult);
      const qcu = new QCU({
        id: '',
        instruction: '',
        proposals: [{ id: givenAnswer }, { id: qcuSolutionId }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solution: qcuSolutionId,
        validator,
      });

      const expectedResult = {
        globalResult: assessResult.result,
        feedback: qcu.feedbacks.invalid,
        solutionId: qcuSolutionId,
      };

      // when
      const result = qcu.assess(givenAnswer);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(QcuCorrectionResponse);
    });
  });
});
