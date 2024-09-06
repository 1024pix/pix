import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { QCM } from '../../../../../../src/devcomp/domain/models/element/QCM.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | QCM', function () {
  describe('#constructor', function () {
    it('should instanciate a QCM with right properties', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');

      // When
      const qcm = new QCM({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [proposal1, proposal2],
      });

      // Then
      expect(qcm.id).equal('123');
      expect(qcm.instruction).equal('instruction');
      expect(qcm.type).equal('qcm');
      expect(qcm.locales).deep.equal(['fr-FR']);
      expect(qcm.proposals).deep.equal([proposal1, proposal2]);
      expect(qcm.feedbacks).to.be.undefined;
    });
  });

  describe('A QCM without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCM({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('A QCM without instruction', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCM({ id: '123' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The instruction is required for a QCM');
    });
  });

  describe('A QCM with an empty list of proposals', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCM({ id: '123', instruction: 'toto', proposals: [] }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('The proposals are required for a QCM');
    });
  });

  describe('A QCM does not have a list of proposals', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QCM({ id: '123', instruction: 'toto', proposals: 'toto' }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('The proposals should be in a list');
    });
  });
});
