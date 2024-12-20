import dayjs from 'dayjs';

export class LegalDocument {
  constructor({ id, service, type, versionAt }) {
    this.id = id;
    this.service = service;
    this.type = type;
    this.versionAt = versionAt;
  }

  buildDocumentPath() {
    const service = this.service.toLowerCase();
    const type = this.type.toLowerCase();
    const versionAt = dayjs(this.versionAt).format('YYYY-MM-DD');
    return `${service}-${type}-${versionAt}`;
  }
}
