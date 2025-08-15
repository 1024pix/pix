import { createOrganizationPlacesLot } from './create-organization-places-lot.js';
import { deleteOrganizationPlacesLot } from './delete-organization-places-lot.js';
import { findOrganizationPlacesLot } from './find-organization-places-lot.js';
import { getDataOrganizationsPlacesStatistics } from './get-data-organizations-places-statistics.js';
import { getOrganizationPlacesCapacity } from './get-organization-places-capacity.js';
import { getOrganizationPlacesLots } from './get-organization-places-lots.js';
import { getOrganizationPlacesStatistics } from './get-organization-places-statistics.js';

const usecases = {
  createOrganizationPlacesLot,
  deleteOrganizationPlacesLot,
  findOrganizationPlacesLot,
  getDataOrganizationsPlacesStatistics,
  getOrganizationPlacesCapacity,
  getOrganizationPlacesLots,
  getOrganizationPlacesStatistics,
};

export { usecases };
