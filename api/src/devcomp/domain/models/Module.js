import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Module {
  static #MINIMAL_NUMBER_OF_GRAINS = 2;

  #id;
  constructor({ id, grains }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un module");
    this.#assertAtLeastTwoGrains(grains);

    this.#id = id;
  }

  #assertAtLeastTwoGrains(grains) {
    if (!this.#atLeastTwoGrains(grains)) {
      throw new Error('Un module doit forcément avoir au moins deux grains');
    }
  }

  #atLeastTwoGrains(grains) {
    return Array.isArray(grains) && grains.length >= Module.#MINIMAL_NUMBER_OF_GRAINS;
  }
}

export { Module };
