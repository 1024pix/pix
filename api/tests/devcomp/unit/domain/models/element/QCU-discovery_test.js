import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { QCUDeclarative } from '../../../../../../src/devcomp/domain/models/element/QCU-declarative.js';
import { QCUDiscovery } from '../../../../../../src/devcomp/domain/models/element/QCU-discovery.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | QCU-discovery', function () {
  describe('#constructor', function () {
    it('should instanciate a QCU-discovery with right properties', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');

      // When
      const qcu = new QCUDiscovery({
        id: '123',
        instruction: 'instruction',
        proposals: [proposal1, proposal2],
        solution: '1',
        hasShortProposals: true,
      });

      // Then
      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.type).equal('qcu-discovery');
      expect(qcu.proposals).deep.equal([proposal1, proposal2]);
      expect(qcu.solution).equal('1');
      expect(qcu.isAnswerable).to.be.true;
      expect(qcu.hasShortProposals).to.be.true;
    });
  });

  describe('A QCUDeclarative without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCUDeclarative({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('A QCUDeclarative without instruction', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCUDeclarative({ id: '123' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The instruction is required for a QCU declarative');
    });
  });

  describe('A QCUDeclarative with an empty list of proposals', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCUDeclarative({ id: '123', instruction: 'toto', proposals: [] }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('The proposals are required for a QCU declarative');
    });
  });

  describe('A QCUDeclarative does not have a list of proposals', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCUDeclarative({ id: '123', instruction: 'toto', proposals: 'toto' }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('The QCU declarative proposals should be a list');
    });
  });
});
