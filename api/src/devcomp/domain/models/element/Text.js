import { Element } from './Element.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Text extends Element {
  constructor({ id, content }) {
    super({ id });

    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour un texte');

    this.content = content;
  }
}

export { Text };
