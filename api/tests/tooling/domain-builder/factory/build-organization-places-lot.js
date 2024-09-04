import { OrganizationPlacesLotForManagement } from '../../../../src/prescription/organization-place/domain/models/OrganizationPlacesLotForManagement.js';

function buildOrganizationPlacesLot({
  id = 1,
  count = 10,
  organizationId = 12,
  activationDate = '2022-01-01',
  expirationDate = '2023-01-01',
  reference = 'abc123',
  category = OrganizationPlacesLotForManagement.categories.FREE_RATE,
  createdBy = 199,
} = {}) {
  return new OrganizationPlacesLotForManagement({
    id,
    count,
    organizationId,
    activationDate,
    expirationDate,
    reference,
    category,
    createdBy,
  });
}

export { buildOrganizationPlacesLot };
