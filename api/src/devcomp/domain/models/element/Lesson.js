import { Element } from './Element.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Lesson extends Element {
  #content;

  constructor({ id, content }) {
    super({ id });

    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour une leçon');

    this.#content = content;
  }

  get content() {
    return this.#content;
  }
}

export { Lesson };
