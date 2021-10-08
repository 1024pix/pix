const {
  expect,
  databaseBuilder,
  domainBuilder,
  knex,
  catchErr,
  learningContentBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const startCampaignParticipation = require('../../../../lib/domain/usecases/start-campaign-participation');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const campaignToJoinRepository = require('../../../../lib/infrastructure/repositories/campaign-to-join-repository');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

describe('Integration | UseCases | start-campaign-participation', function () {
  let userId;
  let organizationId;
  let campaignId;

  beforeEach(async function () {
    const learningContentObjects = learningContentBuilder.buildLearningContent([]);
    mockLearningContent(learningContentObjects);

    organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: false }).id;
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
  });

  it('should save a campaign participation and its assessment when campaign is of type ASSESSMENT', async function () {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT, organizationId }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await DomainTransaction.execute(async (domainTransaction) => {
      await startCampaignParticipation({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        assessmentRepository,
        campaignToJoinRepository,
        domainTransaction,
      });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(1);
    expect(campaignParticipations[0].status).to.equal(CampaignParticipation.statuses.STARTED);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(1);
  });

  it('should save only a campaign participation when campaign is of type PROFILES_COLLECTION', async function () {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION, organizationId }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await DomainTransaction.execute(async (domainTransaction) => {
      await startCampaignParticipation({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        assessmentRepository,
        campaignToJoinRepository,
        domainTransaction,
      });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(1);
    expect(campaignParticipations[0].status).to.equal(CampaignParticipation.statuses.TO_SHARE);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(0);
  });

  it('should throw an error and not create anything when something goes wrong within the transaction', async function () {
    // given
    campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', organizationId }).id;
    await databaseBuilder.commit();
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

    // when
    await catchErr(async () => {
      await DomainTransaction.execute(async (domainTransaction) => {
        await startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          domainTransaction,
        });
        throw new Error('an error occurs within the domain transaction');
      });
    });

    // then
    const campaignParticipations = await knex('campaign-participations');
    expect(campaignParticipations).to.have.lengthOf(0);
    const assessments = await knex('assessments');
    expect(assessments).to.have.lengthOf(0);
  });

  context('when campaign is multipleSendings', function () {
    let campaignParticipation;

    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign({
        multipleSendings: true,
        idPixLabel: null,
        organizationId,
      }).id;
      await databaseBuilder.commit();
    });

    it('should save new participation', async function () {
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId }).id;
      await databaseBuilder.commit();
      campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

      await DomainTransaction.execute(async (domainTransaction) => {
        await startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          domainTransaction,
        });
      });

      const campaignParticipations = await knex('campaign-participations')
        .where('campaignId', campaignId)
        .andWhere('userId', userId);
      expect(campaignParticipations).to.have.lengthOf(2);
    });

    it('should mark old participation as improved', async function () {
      const oldCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isImproved: false,
      }).id;
      await databaseBuilder.commit();
      campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

      await DomainTransaction.execute(async (domainTransaction) => {
        await startCampaignParticipation({
          campaignParticipation,
          userId,
          campaignParticipationRepository,
          assessmentRepository,
          campaignToJoinRepository,
          domainTransaction,
        });
      });

      const result = await knex('campaign-participations').where('id', oldCampaignParticipationId).first();
      expect(result.isImproved).to.be.true;
    });
  });

  context('when campaign has idPixLabel and no participantExternalId', function () {
    let campaignParticipation;

    beforeEach(async function () {
      campaignId = databaseBuilder.factory.buildCampaign({ idPixLabel: 'toto', organizationId }).id;
      await databaseBuilder.commit();
      campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId, participantExternalId: null });
    });

    it('should throw an error', async function () {
      const error = await catchErr(startCampaignParticipation)({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        assessmentRepository,
        campaignToJoinRepository,
      });

      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('participantExternalId');
      expect(error.invalidAttributes[0].message).to.equal(
        'Un identifiant externe est requis pour accèder à la campagne.'
      );
    });

    it('should not create anything', async function () {
      await catchErr(startCampaignParticipation)({
        campaignParticipation,
        userId,
        campaignParticipationRepository,
        assessmentRepository,
        campaignToJoinRepository,
      });

      const campaignParticipations = await knex('campaign-participations');
      expect(campaignParticipations).to.have.lengthOf(0);
      const assessments = await knex('assessments');
      expect(assessments).to.have.lengthOf(0);
    });

    context('when campaign is multipleSendings', function () {
      beforeEach(async function () {
        campaignId = databaseBuilder.factory.buildCampaign({
          multipleSendings: true,
          idPixLabel: 'identifiant',
          organizationId,
        }).id;
        await databaseBuilder.commit();
      });

      context('when it is its first participation', function () {
        it('should throw an error', async function () {
          const error = await catchErr(startCampaignParticipation)({
            campaignParticipation,
            userId,
            campaignParticipationRepository,
            assessmentRepository,
            campaignToJoinRepository,
          });

          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes[0].attribute).to.equal('participantExternalId');
          expect(error.invalidAttributes[0].message).to.equal(
            'Un identifiant externe est requis pour accèder à la campagne.'
          );
        });

        it('should not create anything', async function () {
          await catchErr(startCampaignParticipation)({
            campaignParticipation,
            userId,
            campaignParticipationRepository,
            assessmentRepository,
            campaignToJoinRepository,
          });

          const campaignParticipations = await knex('campaign-participations');
          expect(campaignParticipations).to.have.lengthOf(0);
          const assessments = await knex('assessments');
          expect(assessments).to.have.lengthOf(0);
        });
      });

      context('when it is a retry', function () {
        it('should save new participation with participant external id of first participation', async function () {
          databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId, participantExternalId: '123' }).id;
          await databaseBuilder.commit();
          campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId, participantExternalId: null });

          await DomainTransaction.execute(async (domainTransaction) => {
            await startCampaignParticipation({
              campaignParticipation,
              userId,
              campaignParticipationRepository,
              assessmentRepository,
              campaignToJoinRepository,
              domainTransaction,
            });
          });

          const campaignParticipations = await knex('campaign-participations').where('participantExternalId', 123);
          expect(campaignParticipations).to.have.lengthOf(2);
        });
      });
    });
  });
});
