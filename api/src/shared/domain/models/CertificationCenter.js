import { CERTIFICATION_CENTER_TYPES } from '../../constants.js';

class CertificationCenter {
  /**
   * @param {Object} params
   * @param {number} params.id
   * @param {string} params.name
   * @param {string} params.externalId
   * @param {string} params.type
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
   * @param {Date} params.archivedAt
   * @param {number} params.archivedBy
   * @param {Array} params.habilitations
   */
  constructor({ id, name, externalId, type, createdAt, updatedAt, archivedAt, archivedBy, habilitations = [] } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.archivedAt = archivedAt;
    this.archivedBy = archivedBy;
    this.habilitations = habilitations;
  }

  /**
   * @returns {boolean}
   */
  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  /**
   * @returns {boolean}
   */
  get hasBillingMode() {
    return this.type !== CERTIFICATION_CENTER_TYPES.SCO;
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  isHabilitated(key) {
    return this.habilitations.some((habilitation) => habilitation.key === key);
  }
}
CertificationCenter.types = CERTIFICATION_CENTER_TYPES;

export { CertificationCenter, CERTIFICATION_CENTER_TYPES as types };
