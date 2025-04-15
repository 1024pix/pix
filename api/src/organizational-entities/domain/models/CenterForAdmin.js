import { CERTIFICATION_CENTER_TYPES } from '../../../shared/domain/constants.js';

class CenterForAdmin {
  /**
   * @param {Object} params
   * @param {Object} params.center
   * @param {number} params.center.id
   * @param {CERTIFICATION_CENTER_TYPES} params.center.type
   * @param {Habilitation} params.center.habilitations
   * @param {string} params.center.name
   * @param {string} params.center.externalId
   * @param {Date} params.center.createdAt
   * @param {Date} params.center.updatedAt
   * @param {Date} params.center.archivedAt
   * @param {number} params.archivistFullName
   * @param {boolean} params.center.isComplementaryAlonePilot
   * @param {string} params.dataProtectionOfficer.firstName
   * @param {string} params.dataProtectionOfficer.lastName
   * @param {string} params.dataProtectionOfficer.email
   */
  constructor({ center, archivistFullName, dataProtectionOfficer = {} } = {}) {
    this.id = center.id;
    this.type = center.type;
    this.habilitations = center.habilitations ?? [];
    this.name = center.name;
    this.externalId = center.externalId;
    this.createdAt = center.createdAt;
    this.updatedAt = center.updatedAt;
    this.archivedAt = center.archivedAt;
    this.archivistFullName = archivistFullName;
    this.isComplementaryAlonePilot = center.isComplementaryAlonePilot;
    this.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
    this.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
    this.dataProtectionOfficerEmail = dataProtectionOfficer.email;
  }

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}

CenterForAdmin.types = CERTIFICATION_CENTER_TYPES;

export { CenterForAdmin, CERTIFICATION_CENTER_TYPES as types };
