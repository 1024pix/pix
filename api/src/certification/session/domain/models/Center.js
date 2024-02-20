import { assertEnumValue } from '../../../../shared/domain/models/asserts.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {CenterTypes} props.type
   * @param {Array<number>} props.habilitations List of complementary certification id
   */
  constructor({ id, type, habilitations = [] } = {}) {
    assertEnumValue(CenterTypes, type);

    this.id = id;
    this.type = type;
    this.habilitations = habilitations;
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }
}
