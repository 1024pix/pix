import { expect, sinon } from '../../../../test-helper.js';
import { QCU } from '../../../../../src/devcomp/domain/models/element/QCU.js';
import { QcuCorrectionResponse } from '../../../../../src/devcomp/domain/models/QcuCorrectionResponse.js';

describe('Unit | Devcomp | Domain | Models | QcuForCorrection', function () {
  describe('#assess', function () {
    it('should return a QcuCorrectionResponse for a valid answer', function () {
      // given
      const assessResult = { result: { OK: 'ok' } };
      const qcuSolution = Symbol('correctSolution');
      const userResponse = [qcuSolution];

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: userResponse[0],
          },
        })
        .returns(assessResult);
      const qcu = new QCU({
        id: '',
        instruction: '',
        proposals: [{ id: qcuSolution }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solution: qcuSolution,
        validator,
      });

      const expectedResult = {
        status: assessResult.result,
        feedback: qcu.feedbacks.valid,
        solutionId: qcuSolution,
      };

      // when
      const result = qcu.assess(userResponse);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(QcuCorrectionResponse);
    });

    it('should return a QcuCorrectionResponse for a invalid answer', function () {
      // given
      const assessResult = { result: { KO: 'ko' } };
      const qcuSolution = Symbol('correctSolution');
      const userResponse = ['wrongAnswer'];

      const validator = {
        assess: sinon.stub(),
      };
      validator.assess
        .withArgs({
          answer: {
            value: userResponse[0],
          },
        })
        .returns(assessResult);
      const qcu = new QCU({
        id: '',
        instruction: '',
        proposals: [{ id: qcuSolution }],
        feedbacks: { valid: 'OK', invalid: 'KO' },
        solution: qcuSolution,
        validator,
      });

      const expectedResult = {
        status: assessResult.result,
        feedback: qcu.feedbacks.invalid,
        solutionId: qcuSolution,
      };

      // when
      const result = qcu.assess(userResponse);

      // then
      expect(result).to.deep.equal(expectedResult);
      expect(result).to.be.instanceOf(QcuCorrectionResponse);
    });
  });
});
