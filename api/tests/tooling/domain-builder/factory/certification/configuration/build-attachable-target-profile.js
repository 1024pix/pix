import { AttachableTargetProfile } from '../../../../../../src/certification/configuration/domain/read-models/AttachableTargetProfile.ts';

/**
 * Fluent builder for the {@link AttachableTargetProfile} domain read-model.
 *
 * @example
 * const attachableTargetProfile = domainBuilder.certification.configuration
 *   .attachableTargetProfileBuilder()
 *   .withParameters({ id: 123, name: 'COUCOU' })
 *   .build();
 */
class AttachableTargetProfileBuilder {
  constructor() {
    this.id = 1;
    this.name = 'un super target profile';
  }

  /**
   * @param {object} [params]
   * @param {number} [params.id]
   * @param {string} [params.name]
   * @returns {AttachableTargetProfileBuilder}
   */
  withParameters({ id, name } = {}) {
    this.id = id ?? this.id;
    this.name = name ?? this.name;
    return this;
  }

  /**
   * Materializes the domain AttachableTargetProfile
   *
   * @returns {AttachableTargetProfile}
   */
  build() {
    return new AttachableTargetProfile({
      id: this.id,
      name: this.name,
    });
  }
}

/**
 * Entry point of the fluent AttachableTargetProfile builder
 *
 * @returns {AttachableTargetProfileBuilder}
 */
export function attachableTargetProfileBuilder() {
  return new AttachableTargetProfileBuilder();
}
