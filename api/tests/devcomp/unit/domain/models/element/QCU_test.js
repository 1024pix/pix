import { expect } from '../../../../../test-helper.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';

describe('Unit | Devcomp | Domain | Models | QCU', function () {
  describe('#constructor', function () {
    it('should instanciate a QCU with right properties', function () {
      const qcu = new QCU({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [
          { id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio1' },
          { id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio2' },
        ],
      });

      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.locales).deep.equal(['fr-FR']);
      expect(qcu.proposals).deep.equal([
        { id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio1' },
        { id: 'b5a4c3d2-e1f6-7g8h-9i0j-k1l2m3n4o5p6', content: 'radio2' },
      ]);
    });
  });

  describe('A QCU without id', function () {
    it('should throw an error', function () {
      expect(() => new QCU({})).to.throw("L'id est obligatoire pour un élément");
    });
  });

  describe('A QCU without instruction', function () {
    it('should throw an error', function () {
      expect(() => new QCU({ id: '123' })).to.throw("L'instruction est obligatoire pour un QCU");
    });
  });

  describe('A QCU with an empty list of proposals', function () {
    it('should throw an error', function () {
      expect(() => new QCU({ id: '123', instruction: 'toto', proposals: [] })).to.throw(
        'Les propositions sont obligatoires pour un QCU',
      );
    });
  });

  describe('A QCU does not have a list of proposals', function () {
    it('should throw an error', function () {
      expect(() => new QCU({ id: '123', instruction: 'toto', proposals: 'toto' })).to.throw(
        'Les propositions doivent apparaître dans une liste',
      );
    });
  });
});
