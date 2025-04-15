export class CampaignListItem {
  constructor({ id, name, createdAt, archivedAt, type, code, targetProfileName, tubes }) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.type = type;
    this.code = code;
    this.targetProfileName = targetProfileName;
    this.tubes = tubes;
  }
}
