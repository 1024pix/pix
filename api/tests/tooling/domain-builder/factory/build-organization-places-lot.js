import OrganizationPlacesLot from '../../../../lib/domain/models/OrganizationPlacesLot';

function buildOrganizationPlacesLot({
  id = 1,
  count = 10,
  organizationId = 12,
  activationDate = '2022-01-01',
  expirationDate = '2023-01-01',
  reference = 'abc123',
  category = OrganizationPlacesLot.categories.FREE_RATE,
  createdBy = 199,
} = {}) {
  return new OrganizationPlacesLot({
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

export default buildOrganizationPlacesLot;
