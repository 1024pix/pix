import { assertEnumValue } from '../../../../shared/domain/models/asserts.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {CenterTypes} props.type
   * @param {Array<number>} props.habilitations List of complementary certification id
   * @param {Array<string>} props.features List of center features
   */
  constructor({ id, type, habilitations = [], features = [] } = {}) {
    assertEnumValue(CenterTypes, type);

    this.id = id;
    this.type = type;
    this.habilitations = habilitations;
    this.features = features;
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }
}
