import { QROCM } from '../../../../../../src/devcomp/domain/models/element/QROCM.js';
import { expect } from '../../../../../test-helper.js';

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
      expect(qrocm.locales).to.deep.equal(['fr-FR']);
      expect(qrocm.proposals).to.deep.equal([proposal]);
    });
  });

  describe('A QROCM without id', function () {
    it('should throw an error', function () {
      expect(() => new QROCM({})).to.throw("L'id est obligatoire pour un élément");
    });
  });

  describe('A QROCM without instruction', function () {
    it('should throw an error', function () {
      expect(() => new QROCM({ id: '123' })).to.throw("L'instruction est obligatoire pour un QROCM");
    });
  });

  describe('A QROCM with an empty list of proposals', function () {
    it('should throw an error', function () {
      expect(() => new QROCM({ id: '123', instruction: 'toto', proposals: [] })).to.throw(
        'Les propositions sont obligatoires pour un QROCM',
      );
    });
  });

  describe('A QROCM does not have a list of proposals', function () {
    it('should throw an error', function () {
      expect(() => new QROCM({ id: '123', instruction: 'toto', proposals: 'toto' })).to.throw(
        'Les propositions doivent apparaître dans une liste',
      );
    });
  });
});
