const { expect, databaseBuilder, domainBuilder, knex, catchErr } = require('../../../test-helper');
const startCampaignParticipation = require('../../../../lib/domain/usecases/start-campaign-participation');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const campaignToJoinRepository = require('../../../../lib/infrastructure/repositories/campaign-to-join-repository');

describe('Integration | UseCases | start-campaign-participation', function() {

  let userId;
  let organizationId;
  let targetProfileId;
  let campaignId;

  beforeEach(async function() {
    organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: false }).id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildMembership({
      organizationId, userId,
    });
    targetProfileId = databaseBuilder.factory.buildTargetProfile({ organizationId }).id;
    await databaseBuilder.commit();
  });

  afterEach(async function() {
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
  });

  it('should save a campaign participation and its assessment when campaign is of type ASSESSMENT', async function() {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', creatorId: userId, organizationId, targetProfileId }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await DomainTransaction.execute(async (domainTransaction) => {
      await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(1);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(1);
  });

  it('should save only a campaign participation when campaign is of type PROFILES_COLLECTION', async function() {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', creatorId: userId, organizationId, targetProfileId: null }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await DomainTransaction.execute(async (domainTransaction) => {
      await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(1);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(0);
  });

  it('should throw an error and not create anything when something goes wrong within the transaction', async function() {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', creatorId: userId, organizationId, targetProfileId }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await catchErr(async () => {
      await DomainTransaction.execute(async (domainTransaction) => {
        await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignToJoinRepository, domainTransaction });
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
