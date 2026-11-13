import { OrganizationNotFound } from '../../errors.js';
import { CreditsLotToCreate } from '../models/CreditsLotToCreate.js';

const createCreditsLot = async function ({ organizationId, creditsLot, creditsLotRepository, structureRepository }) {
  const structure = await structureRepository.findByOrganizationId({ organizationId });

  if (!structure) {
    throw new OrganizationNotFound({ meta: { organizationId } });
  }

  const creditsLotToCreate = new CreditsLotToCreate({ ...creditsLot, structureId: structure.id });

  return creditsLotRepository.create(creditsLotToCreate);
};

export { createCreditsLot };
