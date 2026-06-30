export class Attestation {
  constructor({ id, templateName, key, createdAt, label }) {
    this.id = id;
    this.templateName = templateName;
    this.key = key;
    this.createdAt = createdAt;
    this.label = label;
  }
}
