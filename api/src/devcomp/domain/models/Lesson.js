import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Lesson {
  #id;
  #content;

  constructor({ id, content }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour une leçon");
    assertNotNullOrUndefined(content, 'Le contenu est obligatoire pour une leçon');

    this.#id = id;
    this.#content = content;
  }

  get id() {
    return this.#id;
  }

  get content() {
    return this.#content;
  }
}

export { Lesson };
