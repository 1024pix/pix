import { Element } from './Element.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Text extends Element {
  #content;

  constructor({ id, content }) {
    super({ id });

    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour un texte');

    this.#content = content;
  }

  get content() {
    return this.#content;
  }
}

export { Text };
