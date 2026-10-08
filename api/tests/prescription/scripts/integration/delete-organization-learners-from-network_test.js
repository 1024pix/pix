import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../config/config.js';
import { DeleteOrganizationLearnersFromNetworkScript } from '../../../../src/prescription/scripts/delete-organization-learners-from-network.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Script | Prod | Delete Organization Learners From Network', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteOrganizationLearnersFromNetworkScript();
      const { options } = script.metaInfo;

      expect(options.networkId).to.deep.include({
        type: 'number',
        describe: 'an id from a single network',
        demandOption: true,
      });

      expect(options.lastActivityDate).to.deep.include({
        type: 'string',
        describe: 'Delete learners which activity is older than this date',
        demandOption: true,
      });
    });
  });

  describe('Handle', function () {
    let script, logger;

    beforeEach(async function () {
      script = new DeleteOrganizationLearnersFromNetworkScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      // databaseBuilder.factory.buildUser({ id: config.infra.engineeringUserId });
      await databaseBuilder.commit();
    });

    it('runs script with logs', async function () {
      const options = { networkId: 1, lastActivityDate: '2020-01-10' };

      await script.handle({ options, logger });

      expect(
        logger.info.calledWithExactly(
          `Delete learners from network ${options.networkId} with last activity prior to ${options.lastActivityDate}`,
        ),
      ).true;
    });

    it('throws if lastActivityDate is invalid', async function () {
      const options = { networkId: 1, lastActivityDate: 'champignon' };

      const error = await catchErr(script.handle, script)({ options, logger });

      expect(error).ok;
      expect(error.message).equal('invalid lastActivityDate');
    });

    it('throws if network has no organization', async function () {
      const options = { networkId: 1, lastActivityDate: '2023-10-02' };

      const error = await catchErr(script.handle, script)({ options, logger });

      expect(error).ok;
      expect(error.message).to.equal('Network is empty');
    });

    it('deletes a learner and its participations', async function () {
      // given
      databaseBuilder.factory.buildUser({ id: config.infra.engineeringUserId });
      const { network, organization } = await databaseBuilder.factory.buildNetworkAndHeadOrganization();

      const learner = databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization.id });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: learner.id,
        user: learner.userId,
      });
      await databaseBuilder.commit();

      const options = { networkId: network.id, lastActivityDate: '2020-01-10' };

      // when
      await script.handle({ options, logger });

      // then
      const organizationLearnerResult = await knex('organization-learners').where({ id: learner.id }).first();
      const participationResult = await knex('campaign-participations').where({ id: participation.id }).first();

      expect(organizationLearnerResult.deletedAt).not.to.be.null;
      expect(participationResult.deletedAt).not.to.be.null;
    });
  });

  //   it('delete one learner from given organizationId', async function () {
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({ options: { organizationId, executeAnonymization: true }, logger });

  //     const organizationLearnerResult = await knex('organization-learners').where({ organizationId }).first();
  //     const participationResult = await knex('campaign-participations').where({ organizationLearnerId }).first();

  //     expect(organizationLearnerResult.updatedAt).to.deep.equal(now);
  //     expect(organizationLearnerResult.deletedAt).not.to.be.null;
  //     expect(participationResult.deletedAt).not.to.be.null;
  //   });

  //   it('delete multiple learners from given organizationId', async function () {
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //     });

  //     const secondUserId = databaseBuilder.factory.buildUser().id;
  //     const secondOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId: secondUserId,
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId: secondUserId,
  //       organizationLearnerId: secondOrganizationLearnerId,
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({ options: { organizationId, executeAnonymization: true }, logger });

  //     const organizationLearnerResult = await knex('organization-learners').where({ organizationId });
  //     const participationResult = await knex('campaign-participations').whereIn('organizationLearnerId', [
  //       organizationLearnerId,
  //       secondOrganizationLearnerId,
  //     ]);
  //     expect(organizationLearnerResult[0].deletedAt).not.to.be.null;
  //     expect(organizationLearnerResult[1].deletedAt).not.to.be.null;
  //     expect(participationResult[0].deletedAt).not.to.be.null;
  //     expect(participationResult[1].deletedAt).not.to.be.null;
  //   });

  //   it('do not update deletedAt date if learner is already deleted', async function () {
  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const deletedAtDate = new Date('2024-01-01');
  //     const deletedByUser = userId;
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //       deletedBy: deletedByUser,
  //       deletedAt: deletedAtDate,
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({ options: { organizationId, executeAnonymization: true }, logger });

  //     const organizationLearnerResult = await knex('organization-learners').where({ organizationId }).first();

  //     expect(organizationLearnerResult.deletedBy).to.equal(deletedByUser);
  //     expect(organizationLearnerResult.deletedAt).to.deep.equal(deletedAtDate);
  //   });

  //   it('do not update deletedAt date if campaign participation is already deleted', async function () {
  //     const deletedAt = new Date('2021-01-01');
  //     const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
  //     const deletedBy = organizationLearner.userId;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       deletedAt,
  //       deletedBy,
  //       organizationLearnerId: organizationLearner.id,
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({
  //       options: { organizationId: organizationLearner.organizationId, executeAnonymization: true },
  //       logger,
  //     });

  //     const campaignParticipationResult = await knex('campaign-participations')
  //       .where({ organizationLearnerId: organizationLearner.id })
  //       .first();
  //     expect(campaignParticipationResult.deletedAt).to.deep.equal(deletedAt);
  //     expect(campaignParticipationResult.deletedBy).to.equal(deletedBy);
  //   });

  //   it('should not delete data from other organizations', async function () {
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //     });

  //     const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
  //     const secondUserId = databaseBuilder.factory.buildUser().id;
  //     const secondOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId: secondOrganizationId,
  //       userId: secondUserId,
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId: secondUserId,
  //       organizationLearnerId: secondOrganizationLearnerId,
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({ options: { organizationId, executeAnonymization: true }, logger });

  //     const organizationLearnerResult = await knex('organization-learners').orderBy('id');
  //     const participationResult = await knex('campaign-participations').orderBy('id');

  //     expect(organizationLearnerResult[0].deletedAt).not.to.be.null;
  //     expect(participationResult[0].deletedAt).not.to.be.null;

  //     expect(organizationLearnerResult[1].deletedAt).to.be.null;
  //     expect(participationResult[1].deletedAt).to.be.null;
  //   });

  //   it('anonymize organization learners personal info', async function () {
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //       participantExternalId: 'coucou',
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({ options: { organizationId, executeAnonymization: true }, logger });
  //     const organizationLearnerResult = await knex('organization-learners').where({ organizationId }).first();
  //     const participationResult = await knex('campaign-participations').where({ organizationLearnerId }).first();
  //     expect(organizationLearnerResult.firstName).to.equal('');
  //     expect(organizationLearnerResult.lastName).to.equal('');
  //     expect(participationResult.participantExternalId).to.be.null;
  //   });

  //   it('anonymize organization learners personal info even if learner is already deleted', async function () {
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //       deletedBy: config.infra.engineeringUserId,
  //       deletedAt: new Date(),
  //     }).id;
  //     databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({ options: { organizationId, executeAnonymization: true }, logger });
  //     const organizationLearnerResult = await knex('organization-learners').where({ organizationId }).first();

  //     expect(organizationLearnerResult.firstName).to.equal('');
  //     expect(organizationLearnerResult.lastName).to.equal('');
  //   });

  //   it('cut references to user', async function () {
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const training = databaseBuilder.factory.buildTraining();

  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //     }).id;
  //     const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //     });
  //     const assessmentId = databaseBuilder.factory.buildAssessment({
  //       userId,
  //       campaignParticipationId: campaignParticipation.id,
  //     }).id;
  //     databaseBuilder.factory.buildUserRecommendedTraining({
  //       campaignParticipationId: campaignParticipation.id,
  //       trainingId: training.id,
  //       userId: userId,
  //     });

  //     await databaseBuilder.commit();

  //     await script.handle({ options: { organizationId, executeAnonymization: true }, logger });

  //     const organizationLearnerResult = await knex('organization-learners')
  //       .where({ id: organizationLearnerId })
  //       .first();
  //     const participationResult = await knex('campaign-participations').where({ id: campaignParticipation.id }).first();
  //     const assessmentResult = await knex('assessments').where({ id: assessmentId }).first();
  //     const anonymizedRecommendedTrainingResults =
  //       await knex('user-recommended-trainings').whereNull('campaignParticipationId');

  //     expect(organizationLearnerResult.userId).to.equal(null);
  //     expect(participationResult.userId).to.equal(null);
  //     expect(assessmentResult.campaignParticipationId).to.equal(null);
  //     expect(anonymizedRecommendedTrainingResults).lengthOf(1);
  //   });

  //   it('should not anonymize learners, nor detach participations, assessments, recommended trainings when executeAnonymisation is false', async function () {
  //     const organizationId = databaseBuilder.factory.buildOrganization().id;
  //     const userId = databaseBuilder.factory.buildUser().id;
  //     const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //       organizationId,
  //       userId,
  //       deletedBy: config.infra.engineeringUserId,
  //       deletedAt: new Date(),
  //     }).id;
  //     const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
  //       userId,
  //       organizationLearnerId,
  //     });
  //     const assessmentId = databaseBuilder.factory.buildAssessment({
  //       userId,
  //       campaignParticipationId: campaignParticipation.id,
  //     }).id;
  //     const training = databaseBuilder.factory.buildTraining();
  //     databaseBuilder.factory.buildUserRecommendedTraining({
  //       campaignParticipationId: campaignParticipation.id,
  //       trainingId: training.id,
  //       userId: userId,
  //     });
  //     await databaseBuilder.commit();

  //     await script.handle({
  //       options: { organizationId, executeAnonymization: false, date: now },
  //       logger,
  //     });

  //     const organizationLearnerResult = await knex('organization-learners').where({ organizationId }).first();
  //     const participationResult = await knex('campaign-participations').where({ organizationLearnerId }).first();
  //     const assessmentResult = await knex('assessments').where({ id: assessmentId }).first();
  //     const anonymizedRecommendedTrainingResults =
  //       await knex('user-recommended-trainings').whereNull('campaignParticipationId');
  //     expect(organizationLearnerResult.firstName).to.not.equal('');
  //     expect(organizationLearnerResult.lastName).to.not.equal('');
  //     expect(participationResult.participantExternalId).to.be.not.null;
  //     expect(assessmentResult.campaignParticipationId).to.equal(campaignParticipation.id);
  //     expect(anonymizedRecommendedTrainingResults).lengthOf(0);
  //   });

  //   context('when date is given', function () {
  //     it('tests a valid date is given', async function () {
  //       const organizationId = databaseBuilder.factory.buildOrganization().id;

  //       const error = await catchErr(script.handle)({ options: { organizationId, date: 'OHE' }, logger });

  //       expect(error).to.be.ok;
  //       expect(error.message).to.equal("La date passée en paramètre n'est pas valide");
  //     });

  //     it('delete all datas if last participation is before the date', async function () {
  //       const organizationId = databaseBuilder.factory.buildOrganization().id;

  //       const firstUserId = databaseBuilder.factory.buildUser().id;
  //       const organizationLearnerToDeleteId = databaseBuilder.factory.buildOrganizationLearner({
  //         organizationId,
  //         userId: firstUserId,
  //       }).id;
  //       const campaignParticipationToDeleteId = databaseBuilder.factory.buildCampaignParticipation({
  //         userId: firstUserId,
  //         organizationLearnerId: organizationLearnerToDeleteId,
  //         createdAt: new Date('2020-01-01'),
  //       }).id;

  //       const secondUserId = databaseBuilder.factory.buildUser().id;
  //       const organizationLearnerToKeepId = databaseBuilder.factory.buildOrganizationLearner({
  //         organizationId,
  //         userId: secondUserId,
  //       }).id;
  //       const campaignParticipationToKeepId = databaseBuilder.factory.buildCampaignParticipation({
  //         userId: secondUserId,
  //         organizationLearnerId: organizationLearnerToKeepId,
  //         createdAt: new Date('2021-01-01'),
  //       }).id;
  //       await databaseBuilder.commit();

  //       const date = '2020-12-31';
  //       await script.handle({ options: { organizationId, executeAnonymization: true, date }, logger });

  //       const organizationLearnerToDelete = await knex('organization-learners')
  //         .where({
  //           id: organizationLearnerToDeleteId,
  //         })
  //         .first();
  //       const campaignParticipationToDelete = await knex('campaign-participations')
  //         .where({
  //           id: campaignParticipationToDeleteId,
  //         })
  //         .first();
  //       const organizationLearnerToKeep = await knex('organization-learners')
  //         .where({
  //           id: organizationLearnerToKeepId,
  //         })
  //         .first();
  //       const campaignParticipationToKeep = await knex('campaign-participations')
  //         .where({
  //           id: campaignParticipationToKeepId,
  //         })
  //         .first();

  //       expect(organizationLearnerToKeep.deletedAt).to.be.null;
  //       expect(campaignParticipationToKeep.deletedAt).to.be.null;
  //       expect(organizationLearnerToDelete.deletedAt).not.to.be.null;
  //       expect(campaignParticipationToDelete.deletedAt).not.to.be.null;
  //     });

  //     it('do not update deletedAt date if learner is already deleted', async function () {
  //       const userId = databaseBuilder.factory.buildUser().id;
  //       const deletedAtDate = new Date('2020-01-01');
  //       const deletedByUser = userId;
  //       const organizationId = databaseBuilder.factory.buildOrganization().id;
  //       const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //         organizationId,
  //         userId,
  //         deletedBy: deletedByUser,
  //         deletedAt: deletedAtDate,
  //       }).id;
  //       databaseBuilder.factory.buildCampaignParticipation({
  //         userId,
  //         organizationLearnerId,
  //         createdAt: new Date('2019-01-01'),
  //       });
  //       await databaseBuilder.commit();

  //       await script.handle({ options: { organizationId, executeAnonymization: true, date: now }, logger });

  //       const organizationLearnerResult = await knex('organization-learners').where({ organizationId }).first();

  //       expect(organizationLearnerResult.deletedBy).to.equal(deletedByUser);
  //       expect(organizationLearnerResult.deletedAt).to.deep.equal(deletedAtDate);
  //     });

  //     it('do not update deletedAt date if campaign participation is already deleted', async function () {
  //       const deletedAt = new Date('2021-01-01');
  //       const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
  //       const deletedBy = organizationLearner.userId;
  //       databaseBuilder.factory.buildCampaignParticipation({
  //         createdAt: new Date('2020-01-01'),
  //         deletedAt,
  //         deletedBy,
  //         organizationLearnerId: organizationLearner.id,
  //       });
  //       const organizationId = databaseBuilder.factory.buildOrganization().id;
  //       await databaseBuilder.commit();

  //       await script.handle({ options: { organizationId, executeAnonymization: true, date: now }, logger });

  //       const campaignParticipationResult = await knex('campaign-participations')
  //         .where({ organizationLearnerId: organizationLearner.id })
  //         .first();
  //       expect(campaignParticipationResult.deletedAt).to.deep.equal(deletedAt);
  //       expect(campaignParticipationResult.deletedBy).to.equal(deletedBy);
  //     });

  //     it('keep participations if after given date', async function () {
  //       const organizationId = databaseBuilder.factory.buildOrganization().id;

  //       const firstUserId = databaseBuilder.factory.buildUser().id;
  //       const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
  //         organizationId,
  //         userId: firstUserId,
  //       }).id;
  //       const campaignParticipationToDeleteId = databaseBuilder.factory.buildCampaignParticipation({
  //         userId: firstUserId,
  //         organizationLearnerId: organizationLearnerId,
  //         createdAt: new Date('2020-12-30'),
  //         participantExternalId: 'Saphira',
  //       }).id;
  //       const campaignParticipationToKeepId = databaseBuilder.factory.buildCampaignParticipation({
  //         userId: firstUserId,
  //         organizationLearnerId: organizationLearnerId,
  //         createdAt: new Date('2021-01-01'),
  //         participantExternalId: 'Ninja',
  //       }).id;

  //       await databaseBuilder.commit();

  //       const date = '2020-12-31';
  //       await script.handle({ options: { organizationId, executeAnonymization: true, date }, logger });

  //       const campaignParticipationToDelete = await knex('campaign-participations')
  //         .where({
  //           id: campaignParticipationToDeleteId,
  //         })
  //         .first();

  //       const campaignParticipationToKeep = await knex('campaign-participations')
  //         .where({
  //           id: campaignParticipationToKeepId,
  //         })
  //         .first();

  //       expect(campaignParticipationToKeep.deletedAt).to.be.null;
  //       expect(campaignParticipationToKeep.participantExternalId).to.equal('Ninja');

  //       expect(campaignParticipationToDelete.deletedAt).not.to.be.null;
  //       expect(campaignParticipationToDelete.participantExternalId).to.be.null;
  //     });
  //   });
  // });
});
