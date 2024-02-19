import { expect } from '../../../../test-helper.js';
import { QcmCorrectionResponse } from '../../../../../src/devcomp/domain/models/QcmCorrectionResponse.js';
import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';

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
      expect(() => new QcmCorrectionResponse({})).to.throw('The result is required for a QCM answer');
    });
  });

  describe('A QCM correction response without feedback', function () {
    it('should throw an error', function () {
      expect(() => new QcmCorrectionResponse({ status: AnswerStatus.OK })).to.throw(
        'The feedback is required for a QCM answer',
      );
    });
  });

  describe('A QCM correction response without proposal id', function () {
    it('should throw an error', function () {
      expect(() => new QcmCorrectionResponse({ status: AnswerStatus.OK, feedback: 'Bien joué !' })).to.throw(
        'The solutions are required for a QCM answer',
      );
    });
  });
});
