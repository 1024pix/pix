import { config } from '../../../../../../config/config.js';
import { JobController, JobTeam } from '../../../../../shared/application/jobs/job-controller.js';
import { DomainError } from '../../../../../shared/domain/errors.js';
import { logger as l } from '../../../../../shared/infrastructure/utils/logger.js';
import { ValidateGenericFileJob } from '../../../domain/models/jobs/ValidateGenericFileJob.js';
import { usecases } from '../../../domain/usecases/index.js';

class ValidateGenericFileJobController extends JobController {
  #logger;

  constructor({ logger = l } = {}) {
    super(ValidateGenericFileJob.name, {
      description:
        "Valide le fichier au format générique déposé pour un import d'organisation et, s'il est valide, planifie son import par ImportFromGenericFileJob.",
      team: JobTeam.PRESCRIPTION,
    });
    this.#logger = logger;
  }

  get isJobEnabled() {
    return config.pgBoss.validationFileJobEnabled;
  }

  async handle({ data }) {
    const { organizationImportId } = data;
    try {
      await usecases.validateOrganizationLearnersFile({ organizationImportId });
    } catch (err) {
      if (!(err instanceof DomainError)) {
        throw err;
      }
      this.#logger.warn(err);
    }
  }
}

export { ValidateGenericFileJobController };
