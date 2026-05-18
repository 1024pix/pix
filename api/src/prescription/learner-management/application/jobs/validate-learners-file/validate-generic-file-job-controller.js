import { JobController } from '../../../../../shared/application/jobs/job-controller.js';
import { config } from '../../../../../shared/config.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { ValidateGenericFileJob } from '../../../domain/models/jobs/ValidateGenericFileJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class ValidateGenericFileJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ValidateGenericFileJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId } = data;
    try {
      await usecases.validateGenericFile({ organizationImportId });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.warn(err);
    }
  }
}

export { ValidateGenericFileJobController };
