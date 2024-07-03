import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Module {
  constructor({ id, slug, title, grains, details, transitionTexts = [] }) {
    assertNotNullOrUndefined(id, 'The id is required for a module');
    assertNotNullOrUndefined(title, 'The title is required for a module');
    assertNotNullOrUndefined(slug, 'The slug is required for a module');
    assertNotNullOrUndefined(grains, 'A list of grains is required for a module');
    this.#assertGrainsIsAnArray(grains);
    assertNotNullOrUndefined(details, 'The details are required for a module');
    this.#assertTransitionTextsLinkedToGrain(transitionTexts, grains);

    this.id = id;
    this.slug = slug;
    this.title = title;
    this.grains = grains;
    this.transitionTexts = transitionTexts;
    this.details = details;
  }

  #assertTransitionTextsLinkedToGrain(transitionTexts, grains) {
    const isTransitionTextsLinkedToGrain = transitionTexts.every(
      ({ grainId }) => !!grains.find(({ id }) => grainId === id),
    );
    if (!isTransitionTextsLinkedToGrain) {
      throw new Error('All the transition texts should be linked to a grain contained in the module.');
    }
  }

  #assertGrainsIsAnArray(grains) {
    if (!Array.isArray(grains)) {
      throw new Error('A module should have a list of grains');
    }
  }
}

export { Module };
