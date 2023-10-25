import { Lesson } from '../../../../../src/devcomp/domain/models/element/Lesson.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Lesson', function () {
  describe('#constructor', function () {
    it('should create a lesson and keep attributes', function () {
      // when
      const lesson = new Lesson({ id: 'id', content: 'content' });

      // then
      expect(lesson.id).to.equal('id');
      expect(lesson.content).to.equal('content');
    });
  });

  describe('A lesson without id', function () {
    it('should throw an error', function () {
      expect(() => new Lesson({ content: 'content' })).to.throw("L'id est obligatoire pour un élément");
    });
  });

  describe('A lesson without content', function () {
    it('should throw an error', function () {
      expect(() => new Lesson({ id: '1' })).to.throw('Le contenu est obligatoire pour une leçon');
    });
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip('Skip those tests, we keep them in order to discuss with business', function () {
    describe('a lesson in construction', function () {
      describe('A lesson with empty introduction', function () {
        // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
        // eslint-disable-next-line no-empty-function
        it('should not throw an error', function () {});
      });
    });

    describe('a lesson published', function () {
      describe('A lesson with empty introduction', function () {
        // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
        // eslint-disable-next-line no-empty-function
        it('should throw an error', function () {});
      });
    });

    describe('A lesson with a introduction length greater than 3000 characters', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should throw error', function () {});
    });
    describe('A lesson with special characters in the introduction', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should not throw error', function () {});
    });

    describe('A lesson with a duplicate introduction', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should not throw error', function () {});
    });

    describe('A lesson with introductive text', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should ', function () {});
    });

    describe('A lesson', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should be able to be traced back to an assessment de referentiel', function () {});
    });
  });
});
