import { usecases } from '../../domain/usecases/index.js';

class ValidateOrganizationImportFileJobHandler {
  async handle(event) {
    const { organizationImportId } = event;

    await usecases.validateSiecleXmlFile({ organizationImportId });
  }
}

export { ValidateOrganizationImportFileJobHandler };
