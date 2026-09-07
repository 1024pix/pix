import { config } from '../../../../../../config/config.js';
import { JobController } from '../../../../../shared/application/jobs/job-controller.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { ImportFromGenericFileJob } from '../../../domain/models/jobs/ImportFromGenericFileJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class ImportFromGenericJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ImportFromGenericFileJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.importFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId } = data;

    try {
      return await usecases.importLearnersFromGenericFile({ organizationImportId });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.error(err);
    }
  }
}

export { ImportFromGenericJobController };
