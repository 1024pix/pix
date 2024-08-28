import { QcmProposal } from '../../../../../src/devcomp/domain/models/QcmProposal.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | QcmProposal', function () {
  describe('#constructor', function () {
    it('should create a QCM proposal with correct attributes', function () {
      // given
      const id = '1';
      const content = 'vrai';

      // when
      const proposal = new QcmProposal({ id, content });

      // then
      expect(proposal).not.to.be.undefined;
      expect(proposal.id).to.equal(id);
      expect(proposal.content).to.equal(content);
    });
  });

  describe('A QCM proposal without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QcmProposal({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for a QCM proposal');
    });
  });

  describe('A QCM proposal without content', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QcmProposal({ id: '1' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The content is required for a QCM proposal');
    });
  });
});
