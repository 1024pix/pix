import { validate } from '../validators/habilitation-validator.js';

export class Habilitation {
  /**
   * @param {Object} props
   * @param {number} props.id - complementary certification id
   * @param {string} props.key - complementary certification key
   * @param {string} props.label - complementary certification label
   */
  constructor({ id, key, label } = {}) {
    this.id = id;
    this.key = key;
    this.label = label;

    validate(this);
  }
}
