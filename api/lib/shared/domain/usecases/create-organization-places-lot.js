import { OrganizationPlacesLot } from '../models/OrganizationPlacesLot.js';

const createOrganizationPlacesLot = async function ({
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
};

export { createOrganizationPlacesLot };
