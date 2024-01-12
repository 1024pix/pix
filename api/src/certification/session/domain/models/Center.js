import { CenterTypes } from './CenterTypes.js';

class Center {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {CenterTypes} props.type
   * @param {Array<number>} props.habilitations List of complementary certification id
   */
  constructor({ id, type, habilitations = [] } = {}) {
    Center.#assertType(type);

    this.id = id;
    this.type = type;
    this.habilitations = habilitations;
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }

  static #assertType(type) {
    if (!CenterTypes.contains(type)) {
      throw new TypeError('Illegal argument provided');
    }
  }
}

export { Center };
