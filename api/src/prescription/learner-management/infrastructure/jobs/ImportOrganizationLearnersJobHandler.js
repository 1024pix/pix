import { usecases } from '../../domain/usecases/index.js';
import { ImportOrganizationLearnersJob } from './ImportOrganizationLearnersJob.js';

class ImportOrganizationLearnersJobHandler {
  async handle(event) {
    const { organizationImportId } = event;

    return usecases.addOrUpdateOrganizationLearners({ organizationImportId });
  }

  get name() {
    return ImportOrganizationLearnersJob.name;
  }
}

export { ImportOrganizationLearnersJobHandler };
