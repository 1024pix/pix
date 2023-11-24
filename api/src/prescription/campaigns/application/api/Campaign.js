export class Campaign {
  constructor({ id, code, name, title, createdAt, archivedAt, customLandingPageText }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.title = title;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.customLandingPageText = customLandingPageText;
  }
}
