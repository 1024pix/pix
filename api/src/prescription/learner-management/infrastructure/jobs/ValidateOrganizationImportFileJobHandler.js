import { eventBus } from '../../../../../lib/domain/events/index.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
import { usecases } from '../../domain/usecases/index.js';

class ValidateOrganizationImportFileJobHandler {
  async handle(event) {
    const { organizationImportId } = event;

    await ApplicationTransaction.execute(async () => {
      const validatedFileEvent = await usecases.validateSiecleXmlFile({ organizationImportId });
      await eventBus.publish(validatedFileEvent, ApplicationTransaction.getTransactionAsDomainTransaction());
    });
  }
}

export { ValidateOrganizationImportFileJobHandler };
