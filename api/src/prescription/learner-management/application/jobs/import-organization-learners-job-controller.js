import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { config } from '../../../../shared/config.js';
import { ImportOrganizationLearnersJob } from '../../domain/models/ImportOrganizationLearnersJob.js';
import { usecases } from '../../domain/usecases/index.js';

class ImportOrganizationLearnersJobController extends JobController {
  constructor() {
    super(ImportOrganizationLearnersJob.name);
  }

  get isJobEnabled() {
    return config.pgBoss.importFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId } = data;

    return usecases.addOrUpdateOrganizationLearners({ organizationImportId });
  }
}

export { ImportOrganizationLearnersJobController };
