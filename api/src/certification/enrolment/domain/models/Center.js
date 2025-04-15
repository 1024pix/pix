/**
 * @typedef {import ('./Habilitation.js').Habilitation} Habilitation
 */

import { types } from '../../../../organizational-entities/domain/models/Organization.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/domain/constants.js';
import { CERTIFICATION_FEATURES } from '../../../shared/domain/constants.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {CenterTypes} props.type
   * @param {Array<Habilitation>} props.habilitations center habilitations
   * @param {Array<string>} props.features activated center features
   * @param externalId
   */
  constructor({ id, name, externalId, type, habilitations, features, matchingOrganization }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.externalId = externalId;
    this.habilitations = habilitations ?? [];
    this.features = features ?? [];
    this.matchingOrganization = matchingOrganization;
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }

  get isComplementaryAlonePilot() {
    return this.features.includes(CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key);
  }

  get isCoreComplementaryCompatibilityEnabled() {
    return this.isComplementaryAlonePilot;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }

  get matchingOrganizationId() {
    return this.matchingOrganization?.id ?? null;
  }

  get isMatchingOrganizationScoAndManagingStudents() {
    return this.matchingOrganization?.isScoAndManagingStudents ?? false;
  }
}

export class MatchingOrganization {
  constructor({ id, externalId, type, isManagingStudents }) {
    this.id = id;
    this.externalId = externalId;
    this.type = type;
    this.isManagingStudents = isManagingStudents;
  }

  get isScoAndManagingStudents() {
    return this.type === types.SCO && this.isManagingStudents;
  }
}
