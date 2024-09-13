import { QcuProposal } from '../../../../../src/devcomp/domain/models/QcuProposal.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | QcuProposal', function () {
  describe('#constructor', function () {
    it('should create a QCU proposal with correct attributes', function () {
      // given
      const id = '1';
      const content = 'vrai';
      const feedback = 'Correct !';

      // when
      const proposal = new QcuProposal({ id, content, feedback });

      // then
      expect(proposal).not.to.be.undefined;
      expect(proposal.id).to.equal(id);
      expect(proposal.content).to.equal(content);
      expect(proposal.feedback).to.equal(feedback);
    });
  });

  describe('A QCU proposal without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QcuProposal({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for a QCU proposal.');
    });
  });

  describe('A QCU proposal without content', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QcuProposal({ id: '1' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The content is required for a QCU proposal.');
    });
  });
});
