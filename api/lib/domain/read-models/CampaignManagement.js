class CampaignManagement {
  constructor({ id, code, name, createdAt, archivedAt, type, creatorLastName, creatorFirstName, creatorId } = {}) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.creatorLastName = creatorLastName;
    this.creatorFirstName = creatorFirstName;
    this.creatorId = creatorId;
  }
}

module.exports = CampaignManagement;
