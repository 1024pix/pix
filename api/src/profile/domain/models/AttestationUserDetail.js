export class AttestationUserDetail {
  constructor({ id, attestationKey, obtainedAt, userId, label, templateName } = {}) {
    this.id = id;
    this.attestationKey = attestationKey;
    this.userId = userId;
    this.obtainedAt = obtainedAt;
    this.label = label;
    this.templateName = templateName;
  }
}
