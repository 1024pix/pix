import { RevertCampaignParticipationsToStartedScript } from '../../../../src/prescription/scripts/revert-campaign-participations-to-started.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Prescription | Scripts | revert-campaign-participations-to-started', function () {
  describe('options', function () {
    it('has the correct options', function () {
      const script = new RevertCampaignParticipationsToStartedScript();
      const { options } = script.metaInfo;

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'Run the script without making any database changes',
        default: true,
      });

      expect(options.startDate).to.deep.include({
        type: 'string',
        demandOption: true,
        requiresArg: true,
      });

      expect(options.endDate).to.deep.include({
        type: 'string',
        demandOption: true,
        requiresArg: true,
      });
    });

    it('parses dates correctly', function () {
      const validDate = '2024-01-01';
      const invalidDate = { invalid: 'date' };
      const script = new RevertCampaignParticipationsToStartedScript();
      const { options } = script.metaInfo;

      const parsedDate = options.startDate.coerce(validDate);

      expect(parsedDate).to.be.instanceOf(Date);
      expect(() => options.endDate.coerce(invalidDate)).to.throw();
    });
  });

  describe('#handle', function () {
    let script;
    let logger;

    beforeEach(function () {
      script = new RevertCampaignParticipationsToStartedScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
    });

    it('should not update anything when no participations match the criteria', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
        createdAt: new Date('2024-01-15'),
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        createdAt: new Date('2024-01-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      expect(logger.info).to.have.been.calledWith('No participations found to update');
    });

    it('should update participation from TO_SHARE to STARTED and assessment from completed to started', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationId, userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-15'),
      });
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        userId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      const updatedParticipation = await knex('campaign-participations').where({ id: participationId }).first();
      const updatedAssessment = await knex('assessments').where({ id: assessmentId }).first();

      expect(updatedParticipation.status).to.equal(CampaignParticipationStatuses.STARTED);
      expect(updatedAssessment.state).to.equal(Assessment.states.STARTED);
    });

    it('should only update the last assessment when multiple assessments exist', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationId, userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-15'),
      });
      const { id: olderAssessmentId } = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        userId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-10'),
      });
      const { id: newerAssessmentId } = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        userId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      const olderAssessment = await knex('assessments').where({ id: olderAssessmentId }).first();
      const newerAssessment = await knex('assessments').where({ id: newerAssessmentId }).first();

      expect(olderAssessment.state).to.equal(Assessment.states.COMPLETED);
      expect(newerAssessment.state).to.equal(Assessment.states.STARTED);
    });

    it('should skip participation when last assessment is not completed', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationId, userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-15'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        userId,
        state: Assessment.states.STARTED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      const participation = await knex('campaign-participations').where({ id: participationId }).first();
      expect(participation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
      expect(logger.info).to.have.been.calledWithMatch(/is not in completed state/);
    });

    it('should skip participation when no assessment exists', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      const participation = await knex('campaign-participations').where({ id: participationId }).first();
      expect(participation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
      expect(logger.info).to.have.been.calledWithMatch(/No assessment found/);
    });

    it('should only process participations within date range', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationInRange, userId: user1Id } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-15'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationInRange,
        userId: user1Id,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-15'),
      });

      const { id: participationBeforeRange, userId: user2Id } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2023-12-15'),
      });

      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationBeforeRange,
        userId: user2Id,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2023-12-15'),
      });

      const { id: participationAfterRange, userId: user3Id } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-02-15'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationAfterRange,
        userId: user3Id,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-02-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      const inRangeParticipation = await knex('campaign-participations').where({ id: participationInRange }).first();
      const beforeRangeParticipation = await knex('campaign-participations')
        .where({ id: participationBeforeRange })
        .first();
      const afterRangeParticipation = await knex('campaign-participations')
        .where({ id: participationAfterRange })
        .first();

      expect(inRangeParticipation.status).to.equal(CampaignParticipationStatuses.STARTED);
      expect(beforeRangeParticipation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
      expect(afterRangeParticipation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
    });

    it('should include participations on the end date boundary', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationId, userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-31T23:59:59Z'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        userId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-31T23:59:59Z'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      const updatedParticipation = await knex('campaign-participations').where({ id: participationId }).first();
      expect(updatedParticipation.status).to.equal(CampaignParticipationStatuses.STARTED);
    });

    it('should rollback changes in dry run mode', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationId, userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-15'),
      });
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        userId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: true,
        },
      });

      // then
      const participation = await knex('campaign-participations').where({ id: participationId }).first();
      const assessment = await knex('assessments').where({ id: assessmentId }).first();

      expect(participation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
      expect(assessment.state).to.equal(Assessment.states.COMPLETED);
      expect(logger.info).to.have.been.calledWith(
        'ROLLBACK: RevertCampaignParticipationsToStartedScript (dry run mode)',
      );
    });

    it('should update multiple participations', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();

      const { id: participation1Id, userId: user1Id } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-10'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation1Id,
        userId: user1Id,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-10'),
      });

      const { id: participation2Id, userId: user2Id } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-20'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation2Id,
        userId: user2Id,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-20'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      const participation1 = await knex('campaign-participations').where({ id: participation1Id }).first();
      const participation2 = await knex('campaign-participations').where({ id: participation2Id }).first();

      expect(participation1.status).to.equal(CampaignParticipationStatuses.STARTED);
      expect(participation2.status).to.equal(CampaignParticipationStatuses.STARTED);
      expect(logger.info).to.have.been.calledWith('Updated 2 participations');
      expect(logger.info).to.have.been.calledWith('Updated 2 assessments');
    });

    it('should log progress for each participation', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const { id: participationId, userId } = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        createdAt: new Date('2024-01-15'),
      });
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participationId,
        userId,
        state: Assessment.states.COMPLETED,
        type: Assessment.types.CAMPAIGN,
        createdAt: new Date('2024-01-15'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({
        logger,
        options: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          dryRun: false,
        },
      });

      // then
      expect(logger.info).to.have.been.calledWith('BEGIN: RevertCampaignParticipationsToStartedScript');
      expect(logger.info).to.have.been.calledWith('Found 1 participations to update');
      expect(logger.info).to.have.been.calledWith(`Processing participation id: ${participationId}`);
      expect(logger.info).to.have.been.calledWith(
        `Updating participation id: ${participationId} status from TO_SHARE to STARTED`,
      );
      expect(logger.info).to.have.been.calledWith(
        `Updating assessment id: ${assessmentId} state from completed to started`,
      );
      expect(logger.info).to.have.been.calledWith('COMMIT: RevertCampaignParticipationsToStartedScript');
    });
  });
});
