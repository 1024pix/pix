import { NotFoundError } from '../../../../shared/domain/errors.js';

const getSession = async function ({ sessionId, sessionManagementRepository }) {
  const session = await sessionManagementRepository.get({ id: sessionId });

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });
  return {
    session,
    hasSomeCleaAcquired,
  };
};

export { getSession };
