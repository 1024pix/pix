import { usecases } from '../../domain/usecases/index.js';

class ValidateOrganizationImportFileJobHandler {
  async handle(event) {
    const { organizationImportId } = event;

    return usecases.validateSiecleXmlFile({ organizationImportId });
  }
}

export { ValidateOrganizationImportFileJobHandler };
