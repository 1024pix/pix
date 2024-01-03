import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

class Module {
  constructor({ id, slug, title, grains, transitionTexts = [] }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un module");
    assertNotNullOrUndefined(title, 'Le titre est obligatoire pour un module');
    assertNotNullOrUndefined(slug, 'Le slug est obligatoire pour un module');
    assertNotNullOrUndefined(grains, 'Une liste de grains est obligatoire pour un module');
    this.#assertGrainsIsAnArray(grains);
    this.#assertTransitionTextsLinkedToGrain(transitionTexts, grains);

    this.id = id;
    this.slug = slug;
    this.title = title;
    this.grains = grains;
    this.transitionTexts = transitionTexts;
  }

  #assertTransitionTextsLinkedToGrain(transitionTexts, grains) {
    const isTransitionTextsLinkedToGrain = transitionTexts.every(
      ({ grainId }) => !!grains.find(({ id }) => grainId === id),
    );
    if (!isTransitionTextsLinkedToGrain) {
      throw new Error('Tous les textes de transition doivent être lié à un grain présent dans le module');
    }
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
    return this.grains.flatMap(({ elements }) => elements);
  }
}

export { Module };
