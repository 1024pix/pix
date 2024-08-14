import { usecases } from '../../domain/usecases/index.js';

class ImportOrganizationLearnersJobController {
  async handle(data) {
    const { organizationImportId } = data;

    return usecases.addOrUpdateOrganizationLearners({ organizationImportId });
  }
}

export { ImportOrganizationLearnersJobController };
