import { expect } from '../../../../../test-helper.js';
import { QCU } from '../../../../../../src/devcomp/domain/models/element/QCU.js';
import { Feedbacks } from '../../../../../../src/devcomp/domain/models/Feedbacks.js';

describe('Unit | Devcomp | Domain | Models | QCU', function () {
  describe('#constructor', function () {
    it('should instanciate a QCU with right properties', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');
      const solution = Symbol('solution');

      // When
      const qcu = new QCU({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [proposal1, proposal2],
        solution,
      });

      // Then
      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.locales).deep.equal(['fr-FR']);
      expect(qcu.proposals).deep.equal([proposal1, proposal2]);
      expect(qcu.solution).deep.equal(solution);
      expect(qcu.feedbacks).to.be.undefined;
    });

    it('should instanciate a QCU with feedbacks if given', function () {
      // Given
      const proposal1 = Symbol('proposal1');
      const proposal2 = Symbol('proposal2');
      const feedbacks = { valid: 'valid', invalid: 'invalid' };
      const solution = Symbol('solution');

      // When
      const qcu = new QCU({
        id: '123',
        instruction: 'instruction',
        locales: ['fr-FR'],
        proposals: [proposal1, proposal2],
        feedbacks,
        solution,
      });

      // Then
      expect(qcu.id).equal('123');
      expect(qcu.instruction).equal('instruction');
      expect(qcu.locales).deep.equal(['fr-FR']);
      expect(qcu.proposals).deep.equal([proposal1, proposal2]);
      expect(qcu.solution).deep.equal(solution);
      expect(qcu.feedbacks).to.be.instanceof(Feedbacks);
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

  describe('A QCU without a solution', function () {
    it('should throw an error', function () {
      expect(() => new QCU({ id: '123', instruction: 'toto', proposals: [Symbol('proposal1')] })).to.throw(
        'La solution est obligatoire pour un QCU',
      );
    });
  });
});
