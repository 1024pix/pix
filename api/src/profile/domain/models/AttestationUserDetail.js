export class AttestationUserDetail {
  constructor({ id, attestationKey, obtainedAt, userId, label, templateName, requirementsDescription } = {}) {
    this.id = id;
    this.attestationKey = attestationKey;
    this.userId = userId;
    this.obtainedAt = obtainedAt;
    this.label = label;
    this.templateName = templateName;
    this.requirementsDescription = requirementsDescription;
  }
}
