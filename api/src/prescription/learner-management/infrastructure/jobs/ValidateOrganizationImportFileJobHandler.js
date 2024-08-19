import { usecases } from '../../domain/usecases/index.js';
import { ValidateOrganizationImportFileJob } from './ValidateOrganizationImportFileJob.js';

class ValidateOrganizationImportFileJobHandler {
  async handle(event) {
    const { organizationImportId } = event;

    await usecases.validateSiecleXmlFile({ organizationImportId });
  }

  get name() {
    return ValidateOrganizationImportFileJob.name;
  }
}

export { ValidateOrganizationImportFileJobHandler };
