import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { QROCM } from '../../../../../../src/devcomp/domain/models/element/QROCM.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | QROCM', function () {
  describe('#constructor', function () {
    it('should create a QROCM and keep attributes', function () {
      // given
      const proposal = Symbol('block');

      // when
      const qrocm = new QROCM({
        id: '1',
        instruction: '',
        locales: ['fr-FR'],
        proposals: [proposal],
      });

      // then
      expect(qrocm.id).to.equal('1');
      expect(qrocm.instruction).to.equal('');
      expect(qrocm.type).to.equal('qrocm');
      expect(qrocm.locales).to.deep.equal(['fr-FR']);
      expect(qrocm.proposals).to.deep.equal([proposal]);
    });
  });

  describe('A QROCM without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QROCM({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('A QROCM without instruction', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QROCM({ id: '123' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal("L'instruction est obligatoire pour un QROCM");
    });
  });

  describe('A QROCM with an empty list of proposals', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QROCM({ id: '123', instruction: 'toto', proposals: [] }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('Les propositions sont obligatoires pour un QROCM');
    });
  });

  describe('A QROCM does not have a list of proposals', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new QROCM({ id: '123', instruction: 'toto', proposals: 'toto' }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('Les propositions doivent apparaître dans une liste');
    });
  });
});
