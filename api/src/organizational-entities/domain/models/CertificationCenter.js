import { CERTIFICATION_CENTER_TYPES } from '../../../shared/constants.js';

export class CertificationCenter {
  constructor({ id, name, externalId, type, createdAt, updatedAt, habilitations = [], archivedAt, archivedBy } = {}) {
    this.id = id;
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.habilitations = habilitations;
    this.archivedAt = archivedAt;
    this.archivedBy = archivedBy;
  }

  static types = CERTIFICATION_CENTER_TYPES;
}
