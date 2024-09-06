import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';

class Details {
  constructor({ image, description, duration, level, tabletSupport, objectives }) {
    assertNotNullOrUndefined(image, 'The image is required for module details');
    assertNotNullOrUndefined(description, 'The description is required for module details');
    assertNotNullOrUndefined(duration, 'The duration is required for module details');
    assertNotNullOrUndefined(level, 'The level is required for module details');
    assertNotNullOrUndefined(tabletSupport, 'The tabletSupport is required for module details');
    assertNotNullOrUndefined(objectives, 'The objectives are required for module details');
    this.#assertObjectivesIsAnArray(objectives);
    this.#assertObjectivesHasMinimumLength(objectives);

    this.image = image;
    this.description = description;
    this.duration = duration;
    this.level = level;
    this.tabletSupport = tabletSupport;
    this.objectives = objectives;
  }

  #assertObjectivesIsAnArray(objectives) {
    if (!Array.isArray(objectives)) {
      throw new ModuleInstantiationError('The module details should contain a list of objectives');
    }
  }

  #assertObjectivesHasMinimumLength(objectives) {
    if (objectives.length < 1) {
      throw new ModuleInstantiationError('The module details should contain at least one objective');
    }
  }
}

export { Details };
