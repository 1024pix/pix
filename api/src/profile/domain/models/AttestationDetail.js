export class AttestationDetail {
  constructor({ id, obtainedAt, label, key } = {}) {
    this.id = id;
    this.obtainedAt = obtainedAt;
    this.label = label;
    this.key = key;
  }
}
