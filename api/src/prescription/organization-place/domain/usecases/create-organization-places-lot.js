import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedOrganizationPlacesLotRepository from '../../infrastructure/repositories/organization-places-lot-repository.js';
import { OrganizationPlacesLotForManagement } from '../models/OrganizationPlacesLotForManagement.js';

const createOrganizationPlacesLot = async function ({
  organizationPlacesLotData,
  organizationId,
  createdBy,
  organizationPlacesLotRepository = injectedOrganizationPlacesLotRepository,
  organizationRepository = injectedOrganizationRepository,
} = {}) {
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
