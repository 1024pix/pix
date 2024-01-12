import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';

class ComplementaryCertification {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.label
   * @param {ComplementaryCertificationKeys} props.key identifier key
   */
  constructor({ id, label, key } = {}) {
    ComplementaryCertification.#assertKey(key);

    this.id = id;
    this.label = label;
    this.key = key;
  }

  static #assertKey(key) {
    if (!ComplementaryCertificationKeys.contains(key)) {
      throw new TypeError('Illegal argument provided');
    }
  }
}

export { ComplementaryCertification };
