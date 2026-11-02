import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class GlossaryEntry {
  constructor({ words, definition }) {
    assertNotNullOrUndefined(definition, 'The definition is required for module glossary');

    this.words = words;
    this.definition = definition;
  }
}

export { GlossaryEntry };
