import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { config } from '../../../../shared/config.js';
import { ValidateOrganizationImportFileJob } from '../../domain/models/jobs/ValidateOrganizationImportFileJob.js';
import { usecases } from '../../domain/usecases/index.js';

class ValidateOrganizationLearnersImportFileJobController extends JobController {
  constructor() {
    super(ValidateOrganizationImportFileJob.name);
  }

  isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId } = data;

    await usecases.validateSiecleXmlFile({ organizationImportId });
  }
}

export { ValidateOrganizationLearnersImportFileJobController };
