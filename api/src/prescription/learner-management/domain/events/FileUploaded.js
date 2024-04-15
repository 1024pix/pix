import { Event } from '../../../../../lib/domain/events/Event.js';

export class FileUploaded extends Event {
  constructor({ organizationImportId }) {
    super();
    this.organizationImportId = organizationImportId;
  }
}
