import { config } from '../../../../../../config/config.js';
import { JobController } from '../../../../../shared/application/jobs/job-controller.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { ValidateSiecleFileJob } from '../../../domain/models/jobs/ValidateSiecleFileJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class ValidateSiecleFileJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ValidateSiecleFileJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId } = data;
    try {
      await usecases.validateSiecleFile({ organizationImportId });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.warn(err);
    }
  }
}

export { ValidateSiecleFileJobController };
