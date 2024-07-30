import { PayloadTooLargeError } from '../../../../shared/application/http-errors.js';
import { OrganizationImport } from '../models/OrganizationImport.js';
const ERRORS = {
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
};
const handlePayloadTooLargeError = async ({ organizationId, userId, organizationImportRepository }) => {
  const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
  const organizationImportError = new PayloadTooLargeError(
    'An error occurred, payload is too large',
    ERRORS.PAYLOAD_TOO_LARGE,
    {
      maxSize: '20',
    },
  );
  organizationImport.upload({ errors: [organizationImportError] });
  await organizationImportRepository.save(organizationImport);

  throw organizationImportError;
};

export { handlePayloadTooLargeError };
