import { config } from '../../../../../../config/config.js';
import { JobController } from '../../../../../shared/application/jobs/job-controller.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { getI18n } from '../../../../../shared/infrastructure/i18n/i18n.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { ValidateFregataFileJob } from '../../../domain/models/jobs/ValidateFregataFileJob.js';
import { usecases } from '../../../domain/usecases/index.js';
import { FregataParser } from '../../../infrastructure/serializers/csv/parsers/fregata-parser.js';

class ValidateFregataFileJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ValidateFregataFileJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId, locale } = data;
    const i18n = getI18n(locale);

    try {
      await usecases.validateFregataFile({ organizationImportId, i18n, Parser: FregataParser });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.warn(err);
    }
  }
}

export { ValidateFregataFileJobController };
