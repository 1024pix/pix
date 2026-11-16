import { expect } from 'chai';

import { QcmProposal } from '../../../../../src/devcomp/domain/models/QcmProposal.js';

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
});
