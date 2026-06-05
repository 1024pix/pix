import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
/**
 * @typedef {import ('./ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */

export class ComplementaryCertification {
  /**
   * @param {object} props
   * @param {number} props.id
   * @param {string} props.label
   * @param {ComplementaryCertificationKeys|string} props.key identifier key
   */
  constructor({ id, label, key } = {}) {
    this.id = id;
    this.label = label;
    this.key = key;
    this.hasComplementaryReferential = key !== ComplementaryCertificationKeys.CLEA;
  }
}
