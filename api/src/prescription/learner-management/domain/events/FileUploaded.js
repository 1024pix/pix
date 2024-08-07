import { Event } from '../../../../../lib/domain/events/Event.js';

export class FileUploaded extends Event {
  static create({ organizationImportId }) {
    return new FileUploaded({ organizationImportId });
  }

  constructor({ organizationImportId }) {
    super();
    this.organizationImportId = organizationImportId;
  }
}
