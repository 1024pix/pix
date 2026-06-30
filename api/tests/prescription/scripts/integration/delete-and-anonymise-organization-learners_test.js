import { expect } from 'chai';
import sinon from 'sinon';

import { DeleteAndAnonymiseOrganizationLearnerScript } from '../../../../src/prescription/scripts/delete-and-anonymise-organization-learners.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('DeleteAndAnonymiseOrganizationLearnerScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteAndAnonymiseOrganizationLearnerScript();
      const { options } = script.metaInfo;

      expect(options.organizationLearnerIds).to.deep.include({
        type: 'string',
        describe: 'a list of comma separated organization learner ids',
        demandOption: true,
      });
    });

    it('parses list of organizationLearnerIds', async function () {
      const ids = '1,2,3';
      const script = new DeleteAndAnonymiseOrganizationLearnerScript();
      const { options } = script.metaInfo;
      const parsedData = await options.organizationLearnerIds.coerce(ids);

      expect(parsedData).to.deep.equals([1, 2, 3]);
    });
  });

  describe('Handle', function () {
    let script;
    let logger;
    const ENGINEERING_USER_ID = 99999;

    beforeEach(async function () {
      script = new DeleteAndAnonymiseOrganizationLearnerScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      sinon.stub(process, 'env').value({ ENGINEERING_USER_ID });
    });

    describe('anonymise organization learners', function () {
      let learner, otherLearner, campaign, organization, clock, now;

      beforeEach(async function () {
        now = new Date('2024-01-17');
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

        databaseBuilder.factory.buildUser({ id: ENGINEERING_USER_ID });
        organization = databaseBuilder.factory.buildOrganization();
        campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
        learner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          id: 123,
          firstName: 'johnny',
          lastName: 'five',
          organizationId: organization.id,
        });
        otherLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
          id: 456,
          organizationId: organization.id,
        });

        await databaseBuilder.commit();
      });

      afterEach(function () {
        clock.restore();
      });

      it('delete organization learners', async function () {
        // given
        const organizationLearnerIds = [learner.id];

        // when
        await script.handle({ options: { organizationLearnerIds }, logger });

        // then
        const organizationLearnerResult = await knex('organization-learners').whereNotNull('deletedAt');
        expect(organizationLearnerResult).lengthOf(1);
        expect(organizationLearnerResult[0].id).to.equal(learner.id);
        expect(organizationLearnerResult[0].updatedAt).to.deep.equal(now);
        expect(organizationLearnerResult[0].deletedAt).to.deep.equal(now);
        expect(organizationLearnerResult[0].deletedBy).to.equal(ENGINEERING_USER_ID);
      });

      it('anonymise given deleted organization learners id', async function () {
        // when
        await script.handle({
          options: { organizationLearnerIds: [learner.id] },
          logger,
        });
        // then
        const organizationLearnerResult = await knex('organization-learners').whereNull('userId').first();
        expect(organizationLearnerResult.id).to.equal(learner.id);
        expect(organizationLearnerResult.firstName).to.equal('(anonymized)');
        expect(organizationLearnerResult.lastName).to.equal('(anonymized)');
      });

      it('anonymise and delete participations', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          userId: otherLearner.userId,
          organizationLearnerId: otherLearner.id,
          participantExternalId: 'another-learner',
        });

        databaseBuilder.factory.buildCampaignParticipation({
          userId: learner.userId,
          organizationLearnerId: learner.id,
          participantExternalId: 'first',
          campaignId: campaign.id,
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId: learner.userId,
          organizationLearnerId: learner.id,
          participantExternalId: 'second',
          campaignId: campaign.id,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({
          options: { organizationLearnerIds: [learner.id] },
          logger,
        });

        // then
        const participationResult = await knex('campaign-participations').whereNotNull('deletedAt');
        expect(participationResult).lengthOf(2);
        expect(participationResult[0].deletedAt).to.deep.equal(now);
        expect(participationResult[0].deletedBy).to.equal(ENGINEERING_USER_ID);
        expect(participationResult[0].participantExternalId).to.be.null;
        expect(participationResult[0].userId).to.be.null;
        expect(participationResult[1].deletedAt).to.deep.equal(now);
        expect(participationResult[1].deletedBy).to.equal(ENGINEERING_USER_ID);
        expect(participationResult[1].participantExternalId).to.be.null;
        expect(participationResult[1].userId).to.be.null;
      });

      it('detach its assessments and updates updatedAt column', async function () {
        // given
        const otherParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId: otherLearner.userId,
          organizationLearnerId: otherLearner.id,
          participantExternalId: 'other-learner',
        });
        databaseBuilder.factory.buildAssessment({
          userId: otherLearner.userId,
          campaignParticipationId: otherParticipation.id,
        });

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId: learner.userId,
          organizationLearnerId: learner.id,
          participantExternalId: 'coucou',
        });

        databaseBuilder.factory.buildAssessment({
          userId: learner.userId,
          campaignParticipationId: campaignParticipation.id,
        });
        databaseBuilder.factory.buildAssessment({
          userId: learner.userId,
          campaignParticipationId: campaignParticipation.id,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({
          options: { organizationLearnerIds: [learner.id] },
          logger,
        });

        // then
        const assessmentResults = await knex('assessments')
          .where({ updatedAt: now })
          .whereNull('campaignParticipationId');
        expect(assessmentResults).lengthOf(2);
      });

      it('detach its user recommended trainings', async function () {
        // given
        const training = databaseBuilder.factory.buildTraining();
        const training2 = databaseBuilder.factory.buildTraining();

        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId: learner.userId,
          organizationLearnerId: learner.id,
          participantExternalId: 'coucou',
        });

        const otherParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId: otherLearner.userId,
          organizationLearnerId: otherLearner.id,
          participantExternalId: 'other-learner',
        });

        databaseBuilder.factory.buildUserRecommendedTraining({
          campaignParticipationId: campaignParticipation.id,
          trainingId: training.id,
          userId: learner.userId,
        });

        databaseBuilder.factory.buildUserRecommendedTraining({
          campaignParticipationId: otherParticipation.id,
          trainingId: training2.id,
          userId: otherLearner.userId,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({
          options: { organizationLearnerIds: [learner.id] },
          logger,
        });

        // then
        const anonymizedRecommendedTrainingResults =
          await knex('user-recommended-trainings').whereNull('campaignParticipationId');

        const otherRecommendedTrainingResults = await knex('user-recommended-trainings').where({
          campaignParticipationId: otherParticipation.id,
        });

        expect(anonymizedRecommendedTrainingResults).lengthOf(1);
        expect(anonymizedRecommendedTrainingResults[0].campaignParticipationId).to.be.null;
        expect(anonymizedRecommendedTrainingResults[0].updatedAt).to.deep.equal(now);

        expect(otherRecommendedTrainingResults).lengthOf(1);
      });
    });
  });
});
