import { FileValidated } from '../../../domain/events/FileValidated.js';

class ScheduleImportOrganizationLearnersJob {
  static get event() {
    return FileValidated;
  }

  constructor({ importOrganizationLearnersJob }) {
    this.importOrganizationLearnersJob = importOrganizationLearnersJob;
  }

  async handle(event) {
    await this.importOrganizationLearnersJob.schedule(event);
  }

  get name() {
    return 'ImportOrganizationLearnersJob';
  }
}

export { ScheduleImportOrganizationLearnersJob };
