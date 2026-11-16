import { expect } from 'chai';

import { GlossaryEntry } from '../../../../../../src/devcomp/domain/models/module/GlossaryEntry.js';

describe('Unit | Devcomp | Domain | Models | Module | GlossaryEntry', function () {
  describe('#constructor', function () {
    it('should create module glossary and keep attributes', function () {
      // given
      const words = ['Pix'];
      const definition = '<p>Definition de Pix</p>';

      // when
      const glossaryEntry = new GlossaryEntry({ words, definition });

      // then
      expect(glossaryEntry.words).to.equal(words);
      expect(glossaryEntry.definition).to.equal(definition);
    });
  });
});
