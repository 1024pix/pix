import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Module {
  #id;
  #title;
  #list;

  constructor({ id, title, list }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un module");
    assertNotNullOrUndefined(title, 'Le titre est obligatoire pour un module');
    assertNotNullOrUndefined(list, 'Une liste est obligatoire pour un module');
    this.#assertListIsAnArray(list);

    this.#id = id;
    this.#title = title;
    this.#list = list;
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get list() {
    return this.#list;
  }

  #assertListIsAnArray(list) {
    if (!Array.isArray(list)) {
      throw new Error('Un Module doit forcément posséder une liste');
    }
  }
}

export { Module };
