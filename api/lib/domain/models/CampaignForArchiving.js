const { ArchivedCampaignError, ObjectValidationError } = require('../errors');

class CampaignForArchiving {
  constructor({ code, archivedAt, archivedBy } = {}) {
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
}

module.exports = CampaignForArchiving;
