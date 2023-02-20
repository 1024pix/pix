import { ArchivedCampaignError, ObjectValidationError } from '../errors';

class CampaignForArchiving {
  constructor({ id, code, archivedAt, archivedBy } = {}) {
    this.id = id;
    this.code = code;
    this.archivedAt = archivedAt;
    this.archivedBy = archivedBy;
  }

  archive(archivedAt, archivedBy) {
    if (!archivedAt) {
      throw new ObjectValidationError('ArchivedAt Missing');
    }
    if (!archivedBy) {
      throw new ObjectValidationError('ArchivedBy Missing');
    }
    if (this.archivedAt) {
      throw new ArchivedCampaignError('Campaign Already Archived');
    }

    this.archivedAt = archivedAt;
    this.archivedBy = archivedBy;
  }

  unarchive() {
    this.archivedAt = null;
    this.archivedBy = null;
  }
}

export default CampaignForArchiving;
