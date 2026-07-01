/**
 * @typedef {import ('./Habilitation.js').Habilitation} Habilitation
 */

import { types } from '../../../../organizational-entities/domain/models/Organization.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/constants.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  /**
   * @param {object} props
   * @param {number} props.id
   * @param {string} props.name
   * @param {string} props.externalId
   * @param {CenterTypes} props.type
   * @param {Array<Habilitation>} props.habilitations center habilitations
   * @param {MatchingOrganization | null} props.matchingOrganization
   * @param {Date} createdAt
   */
  constructor({ id, name, externalId, type, habilitations, createdAt, matchingOrganization }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.externalId = externalId;
    this.habilitations = habilitations ?? [];
    this.matchingOrganization = matchingOrganization;
    this.createdAt = createdAt;
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
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
