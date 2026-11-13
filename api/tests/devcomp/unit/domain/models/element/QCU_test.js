import { expect } from 'chai';

import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';

describe('Unit | Devcomp | Domain | Models | Element | QCU', function () {
  describe('#constructor', function () {
    it('should instanciate a QCU with right properties', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');

      // When
      const qcu = new QCU({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [proposal1, proposal2],
        solution: 'proposal1',
        hasShortProposals: true,
      });

      // Then
      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.type).equal('qcu');
      expect(qcu.locales).deep.equal(['fr-FR']);
      expect(qcu.proposals).deep.equal([proposal1, proposal2]);
      expect(qcu.solution).deep.equal('proposal1');
      expect(qcu.isAnswerable).to.be.true;
      expect(qcu.hasShortProposals).to.be.true;
      expect(qcu.feedbacks).to.be.undefined;
    });
  });
});
