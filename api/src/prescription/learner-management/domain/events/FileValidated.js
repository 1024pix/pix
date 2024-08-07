import { Event } from '../../../../../lib/domain/events/Event.js';

export class FileValidated extends Event {
  static create({ organizationImportId }) {
    return new FileValidated({ organizationImportId });
  }

  constructor({ organizationImportId }) {
    super();
    this.organizationImportId = organizationImportId;
  }
}
