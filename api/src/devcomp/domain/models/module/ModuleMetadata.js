import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

export class ModuleMetadata {
  constructor({ id, shortId, slug, title, isBeta, duration, image, visibility, level, description, objectives }) {
    assertNotNullOrUndefined(id, 'The id is required for a module metadata');
    assertNotNullOrUndefined(shortId, 'The short id is required for a module metadata');
    assertNotNullOrUndefined(slug, 'The slug is required for a module metadata');
    assertNotNullOrUndefined(title, 'The title is required for a module metadata');
    assertNotNullOrUndefined(isBeta, 'Field isBeta is required for a module metadata');
    assertNotNullOrUndefined(duration, 'The duration is required for a module metadata');
    assertNotNullOrUndefined(image, 'The image is required for a module metadata');
    assertNotNullOrUndefined(visibility, 'The visibility is required for a module metadata');
    this.#assertDurationHasPositiveValue(Number(duration));

    this.id = id;
    this.shortId = shortId;
    this.slug = slug;
    this.title = title;
    this.isBeta = isBeta;
    this.duration = Number(duration);
    this.image = image;
    this.link = `/modules/${this.shortId}/${this.slug}`;
    this.visibility = visibility;
    this.level = level;
    this.description = description;
    this.objectives = objectives;
  }

  #assertDurationHasPositiveValue(duration) {
    if (duration <= 0) {
      throw new DomainError('The duration must be a positive integer for a module metadata');
    }
  }
}
