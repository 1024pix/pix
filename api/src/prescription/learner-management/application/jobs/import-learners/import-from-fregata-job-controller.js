import { config } from '../../../../../../config/config.js';
import { JobController } from '../../../../../shared/application/jobs/job-controller.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { getI18n } from '../../../../../shared/infrastructure/i18n/i18n.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { ImportFromFregataJob } from '../../../domain/models/jobs/ImportFromFregataJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class ImportFromFregataJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ImportFromFregataJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.importFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId, locale } = data;
    const i18n = getI18n(locale);

    try {
      await usecases.importLearnersFromFregataFile({
        organizationImportId,
        i18n,
      });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.error(err);
    }
  }
}

export { ImportFromFregataJobController };
