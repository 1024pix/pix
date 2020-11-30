const { expect, databaseBuilder, domainBuilder, knex, catchErr } = require('../../../test-helper');
const startCampaignParticipation = require('../../../../lib/domain/usecases/start-campaign-participation');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');

describe('Integration | UseCases | start-campaign-participation', () => {

  let userId;
  let organizationId;
  let targetProfileId;
  let campaignId;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildMembership({
      organizationId, userId,
    });
    targetProfileId = databaseBuilder.factory.buildTargetProfile({ organizationId }).id;
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
  });

  it('should save a campaign participation and its assessment', async () => {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', creatorId: userId, organizationId, targetProfileId }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    // when
    await DomainTransaction.execute(async (domainTransaction) => {
      await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository, domainTransaction });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(1);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(1);
  });

  it('should save only a campaign participation', async () => {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', creatorId: userId, organizationId, targetProfileId: null }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await DomainTransaction.execute(async (domainTransaction) => {
      await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository, domainTransaction });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(1);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(0);
  });

  it('should throw an error and not create anything', async () => {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', creatorId: userId, organizationId, targetProfileId }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await catchErr(async () => {
      await DomainTransaction.execute(async (domainTransaction) => {
        await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository, domainTransaction });
        throw new Error('an error occurs within the domain transaction');
      });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(0);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(0);
  });
});
