import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

class Module {
  #id;
  #slug;
  #title;
  #list;

  constructor({ id, slug, title, list }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un module");
    assertNotNullOrUndefined(title, 'Le titre est obligatoire pour un module');
    assertNotNullOrUndefined(slug, 'Le slug est obligatoire pour un module');
    assertNotNullOrUndefined(list, 'Une liste est obligatoire pour un module');
    this.#assertListIsAnArray(list);

    this.#id = id;
    this.#slug = slug;
    this.#title = title;
    this.#list = list;
  }

  get id() {
    return this.#id;
  }

  get slug() {
    return this.#slug;
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

  getElementById(elementId) {
    const foundElement = this.list.find(({ id }) => id === elementId);

    if (foundElement === undefined) {
      throw new NotFoundError();
    }

    return foundElement;
  }
}

export { Module };
