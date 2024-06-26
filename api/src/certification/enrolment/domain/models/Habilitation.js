import { validate } from '../validators/habilitation-validator.js';

export class Habilitation {
  /**
   * @param {Object} props
   * @param {number} props.complementaryCertificationId - complementary certification id
   * @param {string} props.key - complementary certification key
   * @param {string} props.label - complementary certification label
   */
  constructor({ complementaryCertificationId, key, label } = {}) {
    this.complementaryCertificationId = complementaryCertificationId;
    this.key = key;
    this.label = label;

    validate(this);
  }
}
