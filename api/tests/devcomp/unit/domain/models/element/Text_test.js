import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Text', function () {
  describe('#constructor', function () {
    it('should create a text and keep attributes', function () {
      // when
      const text = new Text({ id: 'id', content: 'content' });

      // then
      expect(text.id).to.equal('id');
      expect(text.content).to.equal('content');
      expect(text.type).to.equal('text');
    });
  });

  describe('A text without id', function () {
    it('should throw an error', function () {
      expect(() => new Text({ content: 'content' })).to.throw("L'id est obligatoire pour un élément");
    });
  });

  describe('A text without content', function () {
    it('should throw an error', function () {
      expect(() => new Text({ id: '1' })).to.throw('Le contenu est obligatoire pour un texte');
    });
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip('Skip those tests, we keep them in order to discuss with business', function () {
    describe('a text in construction', function () {
      describe('A text with empty introduction', function () {
        // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
        // eslint-disable-next-line no-empty-function
        it('should not throw an error', function () {});
      });
    });

    describe('a text published', function () {
      describe('A text with empty introduction', function () {
        // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
        // eslint-disable-next-line no-empty-function
        it('should throw an error', function () {});
      });
    });

    describe('A text with a introduction length greater than 3000 characters', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should throw error', function () {});
    });
    describe('A text with special characters in the introduction', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should not throw error', function () {});
    });

    describe('A text with a duplicate introduction', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should not throw error', function () {});
    });

    describe('A text with introductive text', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should ', function () {});
    });

    describe('A text', function () {
      // On permet des tests vides tant qu'on n'a pas validé le comportement attendu avec le métier
      // eslint-disable-next-line no-empty-function
      it('should be able to be traced back to an assessment de referentiel', function () {});
    });
  });
});
