import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

class Module {
  #id;
  #slug;
  #title;
  #grains;

  constructor({ id, slug, title, grains }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un module");
    assertNotNullOrUndefined(title, 'Le titre est obligatoire pour un module');
    assertNotNullOrUndefined(slug, 'Le slug est obligatoire pour un module');
    assertNotNullOrUndefined(grains, 'Une liste de grains est obligatoire pour un module');
    this.#assertGrainsIsAnArray(grains);

    this.#id = id;
    this.#slug = slug;
    this.#title = title;
    this.#grains = grains;
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

  get grains() {
    return this.#grains;
  }

  #assertGrainsIsAnArray(grains) {
    if (!Array.isArray(grains)) {
      throw new Error('Un Module doit forcément posséder une liste de grains');
    }
  }

  getElementById(elementId) {
    const foundElement = this.#getAllElements().find(({ id }) => id === elementId);

    if (foundElement === undefined) {
      throw new NotFoundError();
    }

    return foundElement;
  }

  #getAllElements() {
    return this.#grains.flatMap(({ elements }) => elements);
  }
}

export { Module };
