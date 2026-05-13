import { JobController } from '../../../../../shared/application/jobs/job-controller.js';
import { config } from '../../../../../shared/config.js';
import { withTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { getI18n } from '../../../../../shared/infrastructure/i18n/i18n.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { SUP_IMPORT_TYPES } from '../../../domain/constants.js';
import { ImportFromSupJob } from '../../../domain/models/jobs/ImportFromSupJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class ImportFromSupJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ImportFromSupJob.name);
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.importFileJobEnabled;
  }

  handle = withTransaction(async ({ data }) => {
    const { organizationImportId, locale, type } = data;
    const i18n = getI18n(locale);

    try {
      if (type === SUP_IMPORT_TYPES.REPLACE_STUDENT) {
        const learnerIdsToDelete = await usecases.getDeltaOrganizationLearnerIds({
          organizationImportId,
          i18n,
        });
        const organizationImport = await usecases.getOrganizationImport({ organizationImportId });

        await usecases.deleteOrganizationLearners({
          organizationLearnerIds: learnerIdsToDelete,
          userId: organizationImport.createdBy,
          organizationId: organizationImport.organizationId,
          userRole: 'ORGA_ADMIN',
          client: 'PIX_ORGA',
        });
      }
      await usecases.importLearnersFromSupFile({
        organizationImportId,
        i18n,
      });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.error(err);
    }
  });
}

export { ImportFromSupJobController };
