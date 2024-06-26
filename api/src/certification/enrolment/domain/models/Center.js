import { assertEnumValue } from '../../../../shared/domain/models/asserts.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {CenterTypes} props.type
   * @param {Array<number>} props.habilitations List of complementary certification id
   * @param {Array<string>} props.features List of center features
   * @param externalId
   * @param isV3Pilot
   */
  constructor({
    id,
    name,
    externalId,
    isV3Pilot,
    type,
    habilitations = [],
    features = [],
    isComplementaryAlonePilot,
  } = {}) {
    assertEnumValue(CenterTypes, type);

    this.id = id;
    this.name = name;
    this.type = type;
    this.externalId = externalId;
    this.habilitations = habilitations;
    this.features = features;
    this.isV3Pilot = isV3Pilot;
    this.isComplementaryAlonePilot = isComplementaryAlonePilot;
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }
}
