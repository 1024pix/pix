import { QCMDeclarative } from '../../../../../../src/devcomp/domain/models/element/QCM-declarative.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | QCMDeclarative', function () {
  describe('#constructor', function () {
    it('instanciates a QCM declarative with right properties', function () {
      // Given
      const proposal1 = { id: Symbol('proposal1') };
      const proposal2 = { id: Symbol('proposal2') };

      // When
      const qcmDeclarative = new QCMDeclarative({
        id: '123',
        instruction: 'instruction',
        proposals: [proposal1, proposal2],
      });

      // Then
      expect(qcmDeclarative.id).equal('123');
      expect(qcmDeclarative.instruction).equal('instruction');
      expect(qcmDeclarative.type).equal('qcm-declarative');
      expect(qcmDeclarative.proposals).deep.equal([proposal1, proposal2]);
      expect(qcmDeclarative.isAnswerable).to.be.true;
      expect(qcmDeclarative.hasShortProposals).to.be.false;
    });
  });
});
