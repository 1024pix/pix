import { OrganizationPlacesLotForManagement } from '../models/OrganizationPlacesLotForManagement.js';

const createOrganizationPlacesLot = async function ({
  organizationPlacesLotData,
  organizationId,
  createdBy,
  organizationPlacesLotRepository,
  organizationRepository,
}) {
  await organizationRepository.get(organizationId);

  const organizationPlaceLot = new OrganizationPlacesLotForManagement({
    ...organizationPlacesLotData,
    organizationId,
    createdBy,
  });

  const id = await organizationPlacesLotRepository.create(organizationPlaceLot);
  return await organizationPlacesLotRepository.get(id);
};

export { createOrganizationPlacesLot };
