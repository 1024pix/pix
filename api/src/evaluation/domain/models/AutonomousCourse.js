export class AutonomousCourse {
  constructor({ id, internalTitle, publicTitle, customLandingPageText, createdAt, code }) {
    this.id = id;
    this.internalTitle = internalTitle;
    this.publicTitle = publicTitle;
    this.customLandingPageText = customLandingPageText;
    this.createdAt = createdAt;
    this.code = code;
  }
}
