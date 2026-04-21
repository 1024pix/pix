import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-active-campaign-ids-by-organization', function () {
  let organizationId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.commit();
  });

  it('should return active campaign IDs for the organization', async function () {
    // given
    const activeCampaign1 = databaseBuilder.factory.buildCampaign({
      organizationId,
      deletedAt: null,
    });
    const activeCampaign2 = databaseBuilder.factory.buildCampaign({
      organizationId,
      deletedAt: null,
    });

    await databaseBuilder.commit();

    // when
    const result = await knex.transaction(async (trx) => {
      return usecases.findActiveCampaignIdsByOrganization({ organizationId }, { knex: trx });
    });

    // then
    expect(result).to.have.members([activeCampaign1.id, activeCampaign2.id]);
  });

  it('should not return deleted campaigns', async function () {
    // given
    const activeCampaign = databaseBuilder.factory.buildCampaign({
      organizationId,
      deletedAt: null,
    });
    databaseBuilder.factory.buildCampaign({
      organizationId,
      deletedAt: new Date('2024-01-01'),
    });

    await databaseBuilder.commit();

    // when
    const result = await knex.transaction(async (trx) => {
      return usecases.findActiveCampaignIdsByOrganization({ organizationId }, { knex: trx });
    });

    // then
    expect(result).to.deep.equal([activeCampaign.id]);
  });

  it('should not return campaigns from other organizations', async function () {
    // given
    const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
    const ownCampaign = databaseBuilder.factory.buildCampaign({
      organizationId,
      deletedAt: null,
    });
    databaseBuilder.factory.buildCampaign({
      organizationId: otherOrganizationId,
      deletedAt: null,
    });

    await databaseBuilder.commit();

    // when
    const result = await knex.transaction(async (trx) => {
      return usecases.findActiveCampaignIdsByOrganization({ organizationId }, { knex: trx });
    });

    // then
    expect(result).to.deep.equal([ownCampaign.id]);
  });

  it('should return an empty array when no active campaigns exist', async function () {
    // given
    databaseBuilder.factory.buildCampaign({
      organizationId,
      deletedAt: new Date('2024-01-01'),
    });

    await databaseBuilder.commit();

    // when
    const result = await knex.transaction(async (trx) => {
      return usecases.findActiveCampaignIdsByOrganization({ organizationId }, { knex: trx });
    });

    // then
    expect(result).to.deep.equal([]);
  });
});
