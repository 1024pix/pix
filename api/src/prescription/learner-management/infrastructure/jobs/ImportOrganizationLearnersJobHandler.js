import { usecases } from '../../domain/usecases/index.js';

class ImportOrganizationLearnersJobHandler {
  async handle(event) {
    const { organizationImportId } = event;

    return usecases.addOrUpdateOrganizationLearners({ organizationImportId });
  }
}

export { ImportOrganizationLearnersJobHandler };
