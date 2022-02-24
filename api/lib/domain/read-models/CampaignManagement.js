class CampaignManagement {
  constructor({
    id,
    code,
    name,
    idPixLabel,
    createdAt,
    archivedAt,
    type,
    creatorLastName,
    creatorFirstName,
    creatorId,
    ownerLastName,
    ownerFirstName,
    ownerId,
  } = {}) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.idPixLabel = idPixLabel;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.creatorLastName = creatorLastName;
    this.creatorFirstName = creatorFirstName;
    this.creatorId = creatorId;
    this.ownerLastName = ownerLastName;
    this.ownerFirstName = ownerFirstName;
    this.ownerId = ownerId;
  }
}

module.exports = CampaignManagement;
