import { QrocmCorrectionResponse } from '../../../../../src/devcomp/domain/models/QrocmCorrectionResponse.js';
import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | QrocmCorrectionResponse', function () {
  describe('#constructor', function () {
    it('should create a QROCM correction response and keep attributes', function () {
      // given
      const status = AnswerStatus.OK;
      const feedback = 'Bien joué !';
      const solution = Symbol('solution');

      // when
      const qcuCorrectionResponse = new QrocmCorrectionResponse({ status, feedback, solution });

      // then
      expect(qcuCorrectionResponse).not.to.be.undefined;
      expect(qcuCorrectionResponse.status).to.deep.equal(status);
      expect(qcuCorrectionResponse.feedback).to.equal(feedback);
      expect(qcuCorrectionResponse.solution).to.equal(solution);
    });
  });

  describe('A QROCM correction response without status', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QrocmCorrectionResponse({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The result is required in a QROCM correction');
    });
  });

  describe('A QROCM correction response without feedback', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QrocmCorrectionResponse({ status: AnswerStatus.OK }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The feedback is required in a QROCM correction');
    });
  });

  describe('A QROCM correction response without solutions', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new QrocmCorrectionResponse({ status: AnswerStatus.OK, feedback: { state: 'Bien joué !' } }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The solution is required in a QROCM correction');
    });
  });
});
