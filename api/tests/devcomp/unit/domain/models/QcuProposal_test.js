import { expect } from 'chai';

import { QcuProposal } from '../../../../../src/devcomp/domain/models/QcuProposal.js';

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
});
