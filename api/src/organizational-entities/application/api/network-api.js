import { usecases } from '../../domain/usecases/index.js';
import { NetworkOrganizationDTO } from './models/NetworkOrganizationDTO.js';

/**
 * @module NetworkApi
 */

/**
 * @typedef NetworkOrganizationDTO
 * @type {object}
 * @property {number} organizationId
 */

/**
 * @function
 * @name findNetworkOrganizations
 *
 * @param {Object} params
 * @param {number} params.networkId - The network ID to retrieve organizations for
 * @returns {Promise<Array<NetworkOrganizationDTO>>} - Organizations belonging to the network, empty when the network has none or does not exist
 */
export const findNetworkOrganizations = async ({ networkId }) => {
  const organizationIds = await usecases.findNetworkOrganizations({ networkId });

  return organizationIds.map((organizationId) => new NetworkOrganizationDTO({ organizationId }));
};
