import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export const isSimplifiedAccessCampaign = async function (code) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('campaigns')
    .select({ isSimplifiedAccess: 'target-profiles.isSimplifiedAccess' })
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .where('campaigns.code', code.toUpperCase())
    .first();

  return Boolean(result?.isSimplifiedAccess);
};
