import { usecases } from '../../domain/usecases/index.js';

class ValidateOrganizationLearnersImportFileJobController {
  async handle(event) {
    const { organizationImportId } = event;

    await usecases.validateSiecleXmlFile({ organizationImportId });
  }
}

export { ValidateOrganizationLearnersImportFileJobController };
