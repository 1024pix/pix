import { OrganizationPlacesLotForManagement } from '../models/OrganizationPlacesLotForManagement.js';

const createOrganizationPlacesLot = async function ({
  organizationPlacesLotData,
  organizationId,
  createdBy,
  organizationPlacesLotRepository,
  organizationRepository,
}) {
  await organizationRepository.get(organizationId);

  const organizationPlacesLot = new OrganizationPlacesLotForManagement({
    ...organizationPlacesLotData,
    organizationId,
    createdBy,
  });

  const id = await organizationPlacesLotRepository.create(organizationPlacesLot);
  return await organizationPlacesLotRepository.get(id);
};

export { createOrganizationPlacesLot };
