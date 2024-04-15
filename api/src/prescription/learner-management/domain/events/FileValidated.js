import { Event } from '../../../../../lib/domain/events/Event.js';

export class FileValidated extends Event {
  constructor({ organizationImportId }) {
    super();
    this.organizationImportId = organizationImportId;
  }
}
