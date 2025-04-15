import { EmbedCorrectionResponse } from '../../../../../src/devcomp/domain/models/EmbedCorrectionResponse.js';
import { AnswerStatus } from '../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | EmbedCorrectionResponse', function () {
  describe('#constructor', function () {
    it('should create an embed correction response and keep attributes', function () {
      // given
      const status = AnswerStatus.OK;

      // when
      const embedCorrectionResponse = new EmbedCorrectionResponse({ status, solution: 'toto' });

      // then
      expect(embedCorrectionResponse).not.to.be.undefined;
      expect(embedCorrectionResponse.status).to.deep.equal(status);
      expect(embedCorrectionResponse.feedback).to.equal('');
      expect(embedCorrectionResponse.solution).to.equal('toto');
    });
  });

  describe('A QCU correction response without status', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new EmbedCorrectionResponse({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The result is required for an embed response');
    });
  });

  describe('A QCU correction response without proposal id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () => new EmbedCorrectionResponse({ status: AnswerStatus.OK, feedback: { state: 'Bien joué !' } }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id of the correct proposal is required for an embed response');
    });
  });
});
