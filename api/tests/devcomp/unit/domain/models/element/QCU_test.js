import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

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
      });

      // Then
      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.type).equal('qcu');
      expect(qcu.locales).deep.equal(['fr-FR']);
      expect(qcu.proposals).deep.equal([proposal1, proposal2]);
      expect(qcu.feedbacks).to.be.undefined;
    });
  });

  describe('A QCU without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCU({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });

    describe('A QCU without instruction', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new QCU({ id: '123' }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The instruction is required for a QCU');
      });
    });

    describe('A QCU with an empty list of proposals', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new QCU({ id: '123', instruction: 'toto', proposals: [] }))();

        // then
        expect(error).to.be.instanceOf(ModuleInstantiationError);
        expect(error.message).to.equal('The proposals are required for a QCU');
      });
    });

    describe('A QCU does not have a list of proposals', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new QCU({ id: '123', instruction: 'toto', proposals: 'toto' }))();

        // then
        expect(error).to.be.instanceOf(ModuleInstantiationError);
        expect(error.message).to.equal('The QCU proposals should be a list');
      });
    });
  });
});
