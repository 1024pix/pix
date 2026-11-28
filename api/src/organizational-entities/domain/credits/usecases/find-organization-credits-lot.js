/**
 * @typedef {import ('../../usecases/index.js').CreditsLotRepository} CreditsLotRepository
 * @typedef {import ('../../usecases/index.js').StructureRepository} StructureRepository
 * @typedef {import ('../read-models/CreditsLot.js')} CreditsLot

 */

import { OrganizationNotFound } from '../../errors.js';

/**
 * Retrieves given organization credits lot.
 * @param {Object}
 * @param {number} params.organizationId
 * @param {CreditsLotRepository} params.creditsLotRepository
 * @param {StructureRepository} params.structureRepository
 * @returns {Promise<Array<CreditsLot>>} A promise that resolves to an array of credits lot.
 */
const findOrganizationCreditsLot = async function ({ organizationId, creditsLotRepository, structureRepository }) {
  const structure = await structureRepository.findByOrganizationId({ organizationId });

  if (!structure) {
    throw new OrganizationNotFound({ meta: { organizationId } });
  }

  const creditsLot = await creditsLotRepository.findAllByStructureId(structure.id);

  return creditsLot;
};

export { findOrganizationCreditsLot };
