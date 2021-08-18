const { expect, databaseBuilder, domainBuilder, knex, catchErr } = require('../../../test-helper');
const { perform: startCampaignParticipation } = require('../../../../lib/domain/usecases/start-campaign-participation');
const AssessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository-trx');
const CampaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository-trx');
const CampaignToJoinRepository = require('../../../../lib/infrastructure/repositories/campaign-to-join-repository-trx');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Integration | UseCases | start-campaign-participation', function() {
  let assessmentRepositoryTrx;
  let campaignParticipationRepositoryTrx;
  let campaignToJoinRepositoryTrx;

  let userId;
  let organizationId;
  let targetProfileId;
  let campaignId;

  beforeEach(async function() {
    organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: false }).id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildMembership({ organizationId, userId });
    targetProfileId = databaseBuilder.factory.buildTargetProfile({ organizationId }).id;
    await databaseBuilder.commit();
  });

  afterEach(async function() {
    await knex('assessment-results').delete();
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
  });

  context('when all database access work', function() {
    let knexTrx;

    beforeEach(async function() {
      knexTrx = await knex.transaction();

      assessmentRepositoryTrx = new AssessmentRepository(knexTrx);
      campaignParticipationRepositoryTrx = new CampaignParticipationRepository(knexTrx);
      campaignToJoinRepositoryTrx = new CampaignToJoinRepository(knexTrx);
    });

    it('should save a campaign participation and its assessment when campaign is of type ASSESSMENT', async function() {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', creatorId: userId, organizationId, targetProfileId }).id;
      await databaseBuilder.commit();
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

      // when
      await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepositoryTrx, assessmentRepositoryTrx, campaignToJoinRepositoryTrx });
      await knexTrx.commit();

      // then
      const campaignParticipations = await knex('campaign-participations');
      expect(campaignParticipations).to.have.lengthOf(1);
      const assessments = await knex('assessments').where({ userId });
      expect(assessments).to.have.lengthOf(1);
    });

    it('should save only a campaign participation when campaign is of type PROFILES_COLLECTION', async function() {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', creatorId: userId, organizationId, targetProfileId: null }).id;
      await databaseBuilder.commit();
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

      // when
      await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepositoryTrx, assessmentRepositoryTrx, campaignToJoinRepositoryTrx });
      await knexTrx.commit();
      // then
      const campaignParticipations = await knex('campaign-participations');
      expect(campaignParticipations).to.have.lengthOf(1);
      const assessments = await knex('assessments');
      expect(assessments).to.have.lengthOf(0);
    });
  });

  context('when a database access does not work', function() {
    const startCampaignParticipationWithinFailingTransaction = async (campaignParticipation, userId) => {
      await knex.transaction(async (trx) => {
        const knexTrx = knex.transacting(trx);
        assessmentRepositoryTrx = new AssessmentRepository(knexTrx);
        campaignParticipationRepositoryTrx = new CampaignParticipationRepository(knexTrx);
        campaignToJoinRepositoryTrx = new CampaignToJoinRepository(knexTrx);
        await startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepositoryTrx, assessmentRepositoryTrx, campaignToJoinRepositoryTrx });
        throw Error();
      });
    };

    it('should throw an error and not create anything when something goes wrong within the transaction', async function() {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', creatorId: userId, organizationId, targetProfileId }).id;
      await databaseBuilder.commit();
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

      // when
      await catchErr(startCampaignParticipationWithinFailingTransaction)(campaignParticipation, userId);

      // then
      const campaignParticipations = await knex('campaign-participations');
      expect(campaignParticipations).to.have.lengthOf(0);
      const assessments = await knex('assessments');
      expect(assessments).to.have.lengthOf(0);
    });

    it('should throw an error and not create anything when campaign has idPixLabel and no participantExternalId', async function() {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', idPixLabel: 'toto', creatorId: userId, organizationId, targetProfileId }).id;
      await databaseBuilder.commit();
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId, participantExternalId: null });
      assessmentRepositoryTrx = new AssessmentRepository(knex);
      campaignParticipationRepositoryTrx = new CampaignParticipationRepository(knex);
      campaignToJoinRepositoryTrx = new CampaignToJoinRepository(knex);
      // when
      const error = await catchErr(startCampaignParticipation)({ campaignParticipation, userId, campaignParticipationRepositoryTrx, assessmentRepositoryTrx, campaignToJoinRepositoryTrx });

      // then
      const campaignParticipations = await knex('campaign-participations');
      expect(campaignParticipations).to.have.lengthOf(0);
      const assessments = await knex('assessments');
      expect(assessments).to.have.lengthOf(0);
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });

});
