import { usecases } from '../../domain/usecases/index.js';

class ImportOrganizationLearnersJobHandler {
  constructor({ organizationImportRepository }) {
    this.organizationImportRepository = organizationImportRepository;
  }
  async handle(event) {
    const { organizationImportId } = event;

    const { organizationId } = await this.organizationImportRepository.get(organizationImportId);

    return usecases.addOrUpdateOrganizationLearners({ organizationId });
  }
}

export { ImportOrganizationLearnersJobHandler };
