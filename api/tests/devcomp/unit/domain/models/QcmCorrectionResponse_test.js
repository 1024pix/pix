import { QcmCorrectionResponse } from '../../../../../src/devcomp/domain/models/QcmCorrectionResponse.js';
import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | QcmCorrectionResponse', function () {
  describe('#constructor', function () {
    it('should create a QCM correction response and keep attributes', function () {
      // given
      const status = AnswerStatus.OK;
      const feedback = 'Bien joué !';
      const solution = ['1', '2'];

      // when
      const qcmCorrectionResponse = new QcmCorrectionResponse({ status, feedback, solution });

      // then
      expect(qcmCorrectionResponse).not.to.be.undefined;
      expect(qcmCorrectionResponse.status).to.deep.equal(status);
      expect(qcmCorrectionResponse.feedback).to.equal(feedback);
      expect(qcmCorrectionResponse.solution).to.deep.equal(solution);
    });
  });

  describe('A QCM correction response without status', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QcmCorrectionResponse({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The result is required for a QCM answer');
    });
  });

  describe('A QCM correction response without feedback', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QcmCorrectionResponse({ status: AnswerStatus.OK }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The feedback is required for a QCM answer');
    });
  });

  describe('A QCM correction response without proposal id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new QcmCorrectionResponse({ status: AnswerStatus.OK, feedback: { state: 'Bien joué !' } }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The solutions are required for a QCM answer');
    });
  });
});
