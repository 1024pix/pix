export class Attestation {
  constructor({ id, templateName, key, createdAt } = {}) {
    this.id = id;
    this.templateName = templateName;
    this.key = key;
    this.createdAt = createdAt;
  }
}
