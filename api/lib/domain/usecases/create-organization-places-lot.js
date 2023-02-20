import OrganizationPlacesLot from '../models/OrganizationPlacesLot';

export default async function createOrganizationPlacesLot({
  organizationPlacesLotData,
  organizationId,
  createdBy,
  organizationPlacesLotRepository,
  organizationRepository,
}) {
  await organizationRepository.get(organizationId);

  const organizationPlaceLot = new OrganizationPlacesLot({
    ...organizationPlacesLotData,
    organizationId,
    createdBy,
  });

  const id = await organizationPlacesLotRepository.create(organizationPlaceLot);
  return await organizationPlacesLotRepository.get(id);
}
