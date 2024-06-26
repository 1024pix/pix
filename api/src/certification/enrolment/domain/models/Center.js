/**
 * @typedef {import ('./Habilitation.js').Habilitation} Habilitation
 */

import { CERTIFICATION_FEATURES } from '../../../shared/domain/constants.js';
import { validate } from '../validators/center-validator.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {CenterTypes} props.type
   * @param {Array<Habilitation>} props.habilitations center habilitations
   * @param {Array<string>} props.features activated center features
   * @param externalId
   * @param isV3Pilot
   */
  constructor({ id, name, externalId, isV3Pilot, type, habilitations, features } = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.externalId = externalId;
    this.habilitations = habilitations ?? [];
    this.features = features ?? [];
    this.isV3Pilot = !!isV3Pilot;

    validate(this);
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }

  get isComplementaryAlonePilot() {
    return this.features.includes(CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key);
  }
}
