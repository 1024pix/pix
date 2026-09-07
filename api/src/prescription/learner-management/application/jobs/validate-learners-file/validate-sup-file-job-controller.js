import { config } from '../../../../../../config/config.js';
import { JobController } from '../../../../../shared/application/jobs/job-controller.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { getI18n } from '../../../../../shared/infrastructure/i18n/i18n.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { ValidateSupFileJob } from '../../../domain/models/jobs/ValidateSupFileJob.js';
import { usecases } from '../../../domain/usecases/index.js';
import { SupParser } from '../../../infrastructure/serializers/csv/parsers/sup-parser.js';

class ValidateSupFileJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ValidateSupFileJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId, locale, type } = data;
    const i18n = getI18n(locale);

    try {
      await usecases.validateSupFile({ organizationImportId, i18n, type, Parser: SupParser });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.warn(err);
    }
  }
}

export { ValidateSupFileJobController };
