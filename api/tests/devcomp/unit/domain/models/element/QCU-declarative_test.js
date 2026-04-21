import { QCUDeclarative } from '../../../../../../src/devcomp/domain/models/element/QCU-declarative.js';

describe('Unit | Devcomp | Domain | Models | Element | QCU-declarative', function () {
  describe('#constructor', function () {
    it('should instanciate a QCU-declarative with right properties', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');

      // When
      const qcu = new QCUDeclarative({
        id: '123',
        instruction: 'instruction',
        proposals: [proposal1, proposal2],
      });

      // Then
      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.type).equal('qcu-declarative');
      expect(qcu.proposals).deep.equal([proposal1, proposal2]);
      expect(qcu.isAnswerable).to.be.true;
      expect(qcu.hasShortProposals).to.be.false;
    });
  });
});
