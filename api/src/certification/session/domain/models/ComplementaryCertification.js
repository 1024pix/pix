/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */

export class ComplementaryCertification {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.label
   * @param {ComplementaryCertificationKeys|string} props.key identifier key
   */
  constructor({ id, label, key } = {}) {
    this.id = id;
    this.label = label;
    this.key = key;
  }
}
