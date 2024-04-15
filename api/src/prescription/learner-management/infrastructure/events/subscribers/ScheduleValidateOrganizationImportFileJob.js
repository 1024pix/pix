import { FileUploaded } from '../../../domain/events/FileUploaded.js';

class ScheduleValidateOrganizationImportFileJob {
  static get event() {
    return FileUploaded;
  }

  constructor({ validateOrganizationImportFileJob }) {
    this.validateOrganizationImportFileJob = validateOrganizationImportFileJob;
  }

  async handle(event) {
    await this.validateOrganizationImportFileJob.schedule(event);
  }

  get name() {
    return 'ValidateOrganizationImportFileJob';
  }
}

export { ScheduleValidateOrganizationImportFileJob };
