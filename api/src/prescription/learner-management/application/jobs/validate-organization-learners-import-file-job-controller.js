import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { config } from '../../../../shared/config.js';
import { DomainError } from '../../../../shared/domain/errors.js';
import { logger as l } from '../../../../shared/infrastructure/utils/logger.js';
import { ValidateOrganizationImportFileJob } from '../../domain/models/ValidateOrganizationImportFileJob.js';
import { usecases } from '../../domain/usecases/index.js';

class ValidateOrganizationLearnersImportFileJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ValidateOrganizationImportFileJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId } = data;
    try {
      await usecases.validateSiecleXmlFile({ organizationImportId });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.warn(err);
    }
  }
}

export { ValidateOrganizationLearnersImportFileJobController };
