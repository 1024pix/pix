import { knex } from '../../../db/knex-database-connection.js';
import { CampaignToJoin } from '../../domain/read-models/CampaignToJoin.js';
import { NotFoundError } from '../../domain/errors.js';
import { DomainTransaction } from '../DomainTransaction.js';

const get = async function (id, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const result = await knexConn('campaigns')
    .select('campaigns.*')
    .select({
      organizationId: 'organizations.id',
      organizationName: 'organizations.name',
      organizationType: 'organizations.type',
      organizationLogoUrl: 'organizations.logoUrl',
      organizationIsManagingStudents: 'organizations.isManagingStudents',
      organizationShowNPS: 'organizations.showNPS',
      organizationFormNPSUrl: 'organizations.formNPSUrl',
      targetProfileName: 'target-profiles.name',
      targetProfileImageUrl: 'target-profiles.imageUrl',
    })
    .join('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .where('campaigns.id', id)
    .first();

  if (!result) {
    throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
  }

  return new CampaignToJoin(result);
};

const getByCode = async function (code) {
  const result = await knex('campaigns')
    .select('campaigns.*')
    .select({
      organizationId: 'organizations.id',
      organizationName: 'organizations.name',
      organizationType: 'organizations.type',
      organizationLogoUrl: 'organizations.logoUrl',
      organizationIsManagingStudents: 'organizations.isManagingStudents',
      organizationShowNPS: 'organizations.showNPS',
      organizationFormNPSUrl: 'organizations.formNPSUrl',
      targetProfileName: 'target-profiles.name',
      targetProfileImageUrl: 'target-profiles.imageUrl',
      targetProfileIsSimplifiedAccess: 'target-profiles.isSimplifiedAccess',
      identityProvider: 'organizations.identityProviderForCampaigns',
    })
    .join('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .where('campaigns.code', code)
    .first();

  if (!result) {
    throw new NotFoundError(`La campagne au code ${code} n'existe pas ou son accès est restreint`);
  }

  return new CampaignToJoin(result);
};

export { get, getByCode };
