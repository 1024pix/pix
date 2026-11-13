import { expect } from 'chai';

import { QCM } from '../../../../../../src/devcomp/domain/models/element/QCM.js';

describe('Unit | Devcomp | Domain | Models | Element | QCM', function () {
  describe('#constructor', function () {
    it('should instanciate a QCM with right properties', function () {
      // Given
      const proposal1 = { id: Symbol('proposal1') };
      const proposal2 = { id: Symbol('proposal2') };
      const feedbacks = { valid: Symbol('valid-feedback'), invalid: Symbol('invalid-feedback') };
      const solutions = [proposal1.id];

      // When
      const qcm = new QCM({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [proposal1, proposal2],
        feedbacks,
        solutions,
        hasShortProposals: true,
      });

      // Then
      expect(qcm.id).equal('123');
      expect(qcm.instruction).equal('instruction');
      expect(qcm.type).equal('qcm');
      expect(qcm.locales).deep.equal(['fr-FR']);
      expect(qcm.proposals).deep.equal([proposal1, proposal2]);
      expect(qcm.feedbacks).deep.equal(feedbacks);
      expect(qcm.solutions).deep.equal(solutions);
      expect(qcm.isAnswerable).to.be.true;
      expect(qcm.hasShortProposals).to.be.true;
    });
  });
});
