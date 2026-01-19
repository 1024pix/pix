import { RevertCampaignParticipationsToStartedScript } from '../../../../src/prescription/scripts/revert-campaign-participations-to-started.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

const { buildCampaignParticipation, buildCampaign, buildAssessment } = databaseBuilder.factory;

describe('Integration | Prescription | Scripts | revert-campaign-participations-to-started', function () {
  let script;
  let logger;

  beforeEach(function () {
    script = new RevertCampaignParticipationsToStartedScript();
    logger = {
      info: sinon.stub(),
      warning: sinon.stub(),
      error: sinon.stub(),
    };
  });

  describe('options', function () {
    it('should have the correct options', function () {
      const { options } = script.metaInfo;

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'Run the script without making any database changes',
        default: true,
      });
      expect(options.startDate).to.deep.include({
        type: 'string',
        describe: 'Start date of the period to process, day included, format "YYYY-MM-DD", (ex: "2024-01-20")',
        demandOption: true,
        requiresArg: true,
      });
      expect(options.endDate).to.deep.include({
        type: 'string',
        describe: 'End date of the period to process, day included, format "YYYY-MM-DD", (ex: "2024-02-27")',
        demandOption: true,
        requiresArg: true,
      });
    });
  });

  describe('#handle', function () {
    describe('when no participations are found', function () {
      it('should not update anything and log appropriate message', async function () {
        // given
        const participation = buildCampaignParticipation({
          status: CampaignParticipationStatuses.STARTED,
          createdAt: new Date('2024-01-15'),
        });
        await databaseBuilder.commit();

        const options = {
          dryRun: false,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
        };

        // when
        await script.handle({ logger, options });

        // then
        expect(participation.status).to.equal(CampaignParticipationStatuses.STARTED);
        expect(logger.info).to.have.been.calledWith('No participations found to update');
      });
    });

    describe('when participations are found', function () {
      describe('date range filtering', function () {
        it('should only process participations within the date range (inclusive)', async function () {
          // given
          const beforeRangeParticipation = buildCampaignParticipation({
            status: CampaignParticipationStatuses.TO_SHARE,
            createdAt: new Date('2023-12-31T23:59:59Z'),
          });
          const startDateParticipation = buildCampaignParticipation({
            status: CampaignParticipationStatuses.TO_SHARE,
            createdAt: new Date('2024-01-01T00:00:00Z'),
          });
          const middleDateParticipation = buildCampaignParticipation({
            status: CampaignParticipationStatuses.TO_SHARE,
            createdAt: new Date('2024-01-15T12:00:00Z'),
          });
          const endDateParticipation = buildCampaignParticipation({
            status: CampaignParticipationStatuses.TO_SHARE,
            createdAt: new Date('2024-01-31T23:59:59Z'),
          });
          const afterRangeParticipation = buildCampaignParticipation({
            status: CampaignParticipationStatuses.TO_SHARE,
            createdAt: new Date('2024-02-01T00:00:00Z'),
          });
          await databaseBuilder.commit();

          const options = {
            dryRun: false,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
          };

          // when
          await script.handle({ logger, options });

          // then
          const beforeRangeResult = await knex('campaign-participations')
            .where({ id: beforeRangeParticipation.id })
            .first();
          const startDateResult = await knex('campaign-participations')
            .where({ id: startDateParticipation.id })
            .first();
          const middleDateResult = await knex('campaign-participations')
            .where({ id: middleDateParticipation.id })
            .first();
          const endDateResult = await knex('campaign-participations').where({ id: endDateParticipation.id }).first();
          const afterRangeResult = await knex('campaign-participations')
            .where({ id: afterRangeParticipation.id })
            .first();

          expect(beforeRangeResult.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
          expect(startDateResult.status).to.equal(CampaignParticipationStatuses.STARTED);
          expect(middleDateResult.status).to.equal(CampaignParticipationStatuses.STARTED);
          expect(endDateResult.status).to.equal(CampaignParticipationStatuses.STARTED);
          expect(afterRangeResult.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
        });
      });

      describe('assessment update', function () {
        describe('when participation is of type ASSESSMENT', function () {
          it('should update the last assessment state from completed to started', async function () {
            // given
            const campaignId = buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
            const participation = buildCampaignParticipation({
              campaignId,
              type: CampaignTypes.ASSESSMENT,
              status: CampaignParticipationStatuses.TO_SHARE,
              createdAt: new Date('2024-01-15'),
            });
            const assessment = buildAssessment({
              campaignParticipationId: participation.id,
              state: Assessment.states.COMPLETED,
              createdAt: new Date('2024-01-15'),
            });
            await databaseBuilder.commit();

            const options = {
              dryRun: false,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31'),
            };

            // when
            await script.handle({ logger, options });

            // then
            const updatedAssessment = await knex('assessments').where({ id: assessment.id }).first();
            expect(updatedAssessment.state).to.equal(Assessment.states.STARTED);
          });

          it('should update only the last assessment when multiple assessments exist', async function () {
            // given
            const campaignId = buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
            const participation = buildCampaignParticipation({
              campaignId,
              type: CampaignTypes.ASSESSMENT,
              status: CampaignParticipationStatuses.TO_SHARE,
              createdAt: new Date('2024-01-15'),
            });
            const olderAssessment = buildAssessment({
              campaignParticipationId: participation.id,
              state: Assessment.states.COMPLETED,
              createdAt: new Date('2024-01-15T10:00:00Z'),
            });
            const newerAssessment = buildAssessment({
              campaignParticipationId: participation.id,
              state: Assessment.states.COMPLETED,
              createdAt: new Date('2024-01-15T14:00:00Z'),
            });
            await databaseBuilder.commit();

            const options = {
              dryRun: false,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31'),
            };

            // when
            await script.handle({ logger, options });

            // then
            const updatedOlderAssessment = await knex('assessments').where({ id: olderAssessment.id }).first();
            const updatedNewerAssessment = await knex('assessments').where({ id: newerAssessment.id }).first();
            expect(updatedOlderAssessment.state).to.equal(Assessment.states.COMPLETED);
            expect(updatedNewerAssessment.state).to.equal(Assessment.states.STARTED);
          });

          it('should not update assessment when its state is not completed', async function () {
            // given
            const campaignId = buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
            const participation = buildCampaignParticipation({
              campaignId,
              type: CampaignTypes.ASSESSMENT,
              status: CampaignParticipationStatuses.TO_SHARE,
              createdAt: new Date('2024-01-15'),
            });
            const assessment = buildAssessment({
              campaignParticipationId: participation.id,
              state: Assessment.states.ENDED_BY_INVIGILATOR,
              createdAt: new Date('2024-01-15'),
            });
            await databaseBuilder.commit();

            const options = {
              dryRun: false,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31'),
            };

            // when
            await script.handle({ logger, options });

            // then
            const updatedAssessment = await knex('assessments').where({ id: assessment.id }).first();
            expect(updatedAssessment.state).to.equal(Assessment.states.ENDED_BY_INVIGILATOR);
            expect(logger.warning).to.have.been.calledWithMatch(
              `Last assessment id: ${assessment.id} for participation id: ${participation.id} is not in completed state (current state: ${assessment.state}), skipping`,
            );
          });

          it('should log a warning when no assessment is found for the participation', async function () {
            // given
            const campaignId = buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
            const participation = buildCampaignParticipation({
              campaignId,
              type: CampaignTypes.ASSESSMENT,
              status: CampaignParticipationStatuses.TO_SHARE,
              createdAt: new Date('2024-01-15'),
            });
            await databaseBuilder.commit();

            const options = {
              dryRun: false,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31'),
            };

            // when
            await script.handle({ logger, options });

            // then
            const updatedParticipation = await knex('campaign-participations').where({ id: participation.id }).first();
            expect(updatedParticipation.status).to.equal(CampaignParticipationStatuses.STARTED);
            expect(logger.warning).to.have.been.calledWithMatch(/No assessment found for participation id/);
          });
        });

        describe('when participation is of type PROFILES_COLLECTION', function () {
          it('should skip assessment update', async function () {
            // given
            const campaignId = buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION }).id;
            buildCampaignParticipation({
              campaignId,
              type: CampaignTypes.PROFILES_COLLECTION,
              status: CampaignParticipationStatuses.TO_SHARE,
              createdAt: new Date('2024-01-15'),
            });
            await databaseBuilder.commit();

            const options = {
              dryRun: false,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31'),
            };

            // when
            await script.handle({ logger, options });

            // then
            expect(logger.info).to.have.been.calledWith(
              'Participation is of type PROFILES_COLLECTION, skipping assessment update',
            );
          });
        });

        describe('when participation has been deleted', function () {
          it('should skip assessment update', async function () {
            // given
            const campaignId = buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
            buildCampaignParticipation({
              campaignId,
              type: CampaignTypes.ASSESSMENT,
              status: CampaignParticipationStatuses.TO_SHARE,
              createdAt: new Date('2024-01-15'),
              deletedAt: new Date('2024-01-20'),
            });
            await databaseBuilder.commit();

            const options = {
              dryRun: false,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31'),
            };

            // when
            await script.handle({ logger, options });

            // then
            expect(logger.info).to.have.been.calledWith('Participation has been deleted, skipping assessment update');
          });
        });
      });

      describe('dry run mode', function () {
        it('should rollback all changes when dryRun is true', async function () {
          // given
          const campaignId = buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
          const participation = buildCampaignParticipation({
            campaignId,
            type: CampaignTypes.ASSESSMENT,
            status: CampaignParticipationStatuses.TO_SHARE,
            createdAt: new Date('2024-01-15'),
          });
          const assessment = buildAssessment({
            campaignParticipationId: participation.id,
            state: Assessment.states.COMPLETED,
            createdAt: new Date('2024-01-15'),
          });
          await databaseBuilder.commit();

          const options = {
            dryRun: true,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
          };

          // when
          await script.handle({ logger, options });

          // then
          const unchangedParticipation = await knex('campaign-participations').where({ id: participation.id }).first();
          const unchangedAssessment = await knex('assessments').where({ id: assessment.id }).first();

          expect(unchangedParticipation.status).to.equal(CampaignParticipationStatuses.TO_SHARE);
          expect(unchangedAssessment.state).to.equal(Assessment.states.COMPLETED);
          expect(logger.info).to.have.been.calledWith(
            'ROLLBACK: RevertCampaignParticipationsToStartedScript (dry run mode)',
          );
          expect(logger.info).to.have.been.calledWith('Use --dryRun=false to persist changes');
        });
      });

      describe('non-dry run mode', function () {
        it('should commit all changes when dryRun is false', async function () {
          // given
          const campaignId = buildCampaign({ type: CampaignTypes.ASSESSMENT }).id;
          const participation = buildCampaignParticipation({
            campaignId,
            type: CampaignTypes.ASSESSMENT,
            status: CampaignParticipationStatuses.TO_SHARE,
            createdAt: new Date('2024-01-15'),
          });
          const assessment = buildAssessment({
            campaignParticipationId: participation.id,
            state: Assessment.states.COMPLETED,
            createdAt: new Date('2024-01-15'),
          });
          await databaseBuilder.commit();

          const options = {
            dryRun: false,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
          };

          // when
          await script.handle({ logger, options });

          // then
          const updatedParticipation = await knex('campaign-participations').where({ id: participation.id }).first();
          const updatedAssessment = await knex('assessments').where({ id: assessment.id }).first();

          expect(updatedParticipation.status).to.equal(CampaignParticipationStatuses.STARTED);
          expect(updatedAssessment.state).to.equal(Assessment.states.STARTED);
          expect(logger.info).to.have.been.calledWith('COMMIT: RevertCampaignParticipationsToStartedScript');
        });
      });
    });
  });
});
