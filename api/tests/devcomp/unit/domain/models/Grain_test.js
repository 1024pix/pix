import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Grain', function () {
  describe('#constructor', function () {
    it('should create a grain and keep attributes', function () {
      // when
      const grain = new Grain({ id: 'id', introduction: 'introduction', content: 'content' });

      // then
      expect(grain.id).to.equal('id');
      expect(grain.introduction).to.equal('introduction');
      expect(grain.content).to.equal('content');
    });
  });
  describe('A grain without id', function () {
    it('should throw an error', function () {
      expect(() => new Grain({ introduction: 'introduction', content: 'content' })).to.throw(
        "L'id est obligatoire pour un grain",
      );
    });
  });

  describe('a grain in construction', function () {
    describe('A grain with empty introduction', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should not throw an error', function () {});
    });
  });

  describe('a grain published', function () {
    describe('A grain with empty introduction', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should throw an error', function () {});
    });
  });

  describe('A grain with a introduction length greater than 3000 characters', function () {
    // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
    // eslint-disable-next-line no-empty-function
    it('should throw error', function () {});
  });
  describe('A grain with special characters in the introduction', function () {
    // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
    // eslint-disable-next-line no-empty-function
    it('should not throw error', function () {});
  });

  describe('A grain with a duplicate introduction', function () {
    // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
    // eslint-disable-next-line no-empty-function
    it('should not throw error', function () {});
  });

  describe('A grain with introductive text', function () {
    // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
    // eslint-disable-next-line no-empty-function
    it('should ', function () {});
  });

  describe('A grain', function () {
    // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
    // eslint-disable-next-line no-empty-function
    it('should be able to be traced back to an assessment de referentiel', function () {});
  });
});
