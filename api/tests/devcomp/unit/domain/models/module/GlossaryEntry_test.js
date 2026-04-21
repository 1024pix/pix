import { GlossaryEntry } from '../../../../../../src/devcomp/domain/models/module/GlossaryEntry.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Module | GlossaryEntry', function () {
  describe('#constructor', function () {
    it('should create module glossary and keep attributes', function () {
      // given
      const word = 'Pix';
      const definition = '<p>Definition de Pix</p>';

      // when
      const glossaryEntry = new GlossaryEntry({ word, definition });

      // then
      expect(glossaryEntry.word).to.equal(word);
      expect(glossaryEntry.definition).to.equal(definition);
    });

    describe('if glossary do not have word', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new GlossaryEntry({
              definition: '<p>Definition de Pix</p>',
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The word is required for module glossary');
      });
    });

    describe('if glossary do not have definition', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new GlossaryEntry({
              word: 'Pix',
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The definition is required for module glossary');
      });
    });
  });
});
