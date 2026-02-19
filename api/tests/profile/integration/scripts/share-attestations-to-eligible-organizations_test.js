import { CampaignParticipationStatuses, CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { ShareAttestationsToEligibleOrganizationsScript } from '../../../../src/profile/scripts/share-attestations-to-eligible-organizations.js';
import { REWARD_TYPES } from '../../../../src/quest/domain/constants.js';
import {
  CRITERION_COMPARISONS,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../src/quest/domain/models/Quest.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Profile | Scripts | sixth-grade-organization-share  ', function () {
  describe('options', function () {
    it('has the correct options', function () {
      const script = new ShareAttestationsToEligibleOrganizationsScript();
      const { options } = script.metaInfo;

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'Run the script without making any database changes',
        default: true,
      });
    });
  });

  describe('#handle', function () {
    let script;
    let logger;
    let organization1Id;
    let organization2Id;
    let organizationWithoutAttestationId;
    let attestation1Id;
    let attestation2Id;
    let targetProfile1Id;
    let targetProfile2Id;

    beforeEach(async function () {
      logger = { info: sinon.spy(), error: sinon.spy() };
      script = new ShareAttestationsToEligibleOrganizationsScript();

      const tagPC1 = databaseBuilder.factory.buildTag({ name: 'TAG_PC1' });
      const tagPC2 = databaseBuilder.factory.buildTag({ name: 'TAG_PC2' });

      organization1Id = databaseBuilder.factory.buildOrganization().id;
      organization2Id = databaseBuilder.factory.buildOrganization().id;
      organizationWithoutAttestationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationTag({ tagId: tagPC1.id, organizationId: organization1Id });
      databaseBuilder.factory.buildOrganizationTag({ tagId: tagPC2.id, organizationId: organization2Id });

      attestation1Id = databaseBuilder.factory.buildAttestation({ key: 'attestation1' }).id;
      attestation2Id = databaseBuilder.factory.buildAttestation({ key: 'attestation2' }).id;

      targetProfile1Id = databaseBuilder.factory.buildTargetProfile().id;

      targetProfile2Id = databaseBuilder.factory.buildTargetProfile().id;

      databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: attestation1Id,
        successRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            comparison: REQUIREMENT_COMPARISONS.ALL,
            data: {
              targetProfileId: { data: targetProfile1Id, comparison: CRITERION_COMPARISONS.EQUAL },
            },
          },
        ],
        eligibilityRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            comparison: REQUIREMENT_COMPARISONS.ALL,
            data: {
              tags: {
                data: ['TAG_PC1'],
                comparison: CRITERION_COMPARISONS.ALL,
              },
            },
          },
        ],
      });
      databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: attestation2Id,
        successRequirements: [],
        eligibilityRequirements: [
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
            comparison: REQUIREMENT_COMPARISONS.ALL,
            data: {
              targetProfileId: { data: targetProfile2Id, comparison: CRITERION_COMPARISONS.EQUAL },
            },
          },
          {
            requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
            comparison: REQUIREMENT_COMPARISONS.ALL,
            data: {
              tags: {
                data: ['TAG_PC2'],
                comparison: CRITERION_COMPARISONS.ALL,
              },
            },
          },
        ],
      });

      await databaseBuilder.commit();
    });

    it('should not create organization profile reward if participation is not eligible to quest', async function () {
      // given
      const { id: learnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organizationWithoutAttestationId,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organizationWithoutAttestationId,
        targetProfileId: targetProfile1Id,
      });
      const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organizationWithoutAttestationId,
        targetProfileId: targetProfile2Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learnerId,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2Id,
        organizationLearnerId: learnerId,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation1Id,
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation2Id,
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ logger, options: { dryRun: false } });

      const organizationProfileReward = await knex('organizations-profile-rewards').where(
        'organizationId',
        organizationWithoutAttestationId,
      );

      // then
      expect(organizationProfileReward).lengthOf(0);
    });

    it('should not create organization profile reward if it already exists', async function () {
      // given
      const { id: learnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization1Id,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization1Id,
        targetProfileId: targetProfile1Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learnerId,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      const { id: profileRewardId } = databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation1Id,
      });
      const { id: organizationProfileRewardId } = databaseBuilder.factory.buildOrganizationProfileReward({
        organizationId: organization1Id,
        profileRewardId,
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ logger, options: { dryRun: false } });

      const organizationProfileReward = await knex('organizations-profile-rewards')
        .where('organizationId', organization1Id)
        .first();

      // then
      expect(organizationProfileReward.id).equal(organizationProfileRewardId);
    });

    it('should create organization profile reward for eligible organization', async function () {
      // given
      const { id: learnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization1Id,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization1Id,
        targetProfileId: targetProfile1Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learnerId,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      const { id: profileRewardId } = databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation1Id,
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ logger, options: { dryRun: false } });

      const organizationProfileReward = await knex('organizations-profile-rewards')
        .where('organizationId', organization1Id)
        .first();

      // then
      expect(organizationProfileReward.profileRewardId).equal(profileRewardId);
    });

    it('should create organization profile reward only if eligibility match', async function () {
      // given
      const { id: learner1Id, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization1Id,
      });
      const { id: learner2Id } = databaseBuilder.factory.buildOrganizationLearner({
        userId: userId,
        organizationId: organization2Id,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization1Id,
        targetProfileId: targetProfile1Id,
      });
      const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization2Id,
        targetProfileId: targetProfile1Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learner1Id,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2Id,
        organizationLearnerId: learner2Id,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation1Id,
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ logger, options: { dryRun: false } });

      const organization1ProfileReward = await knex('organizations-profile-rewards').where(
        'organizationId',
        organization1Id,
      );
      const organization2ProfileReward = await knex('organizations-profile-rewards').where(
        'organizationId',
        organization2Id,
      );

      // then
      expect(organization1ProfileReward).lengthOf(1);
      expect(organization2ProfileReward).lengthOf(0);
    });

    it('should not create organization profile reward if latest valid campaign participation is not shared', async function () {
      // given
      const { id: learnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization1Id,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization1Id,
        targetProfileId: targetProfile1Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learnerId,
        userId: userId,
        status: CampaignParticipationStatuses.STARTED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learnerId,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
        isImproved: true,
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation1Id,
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ logger, options: { dryRun: false } });

      const organizationProfileReward = await knex('organizations-profile-rewards').where(
        'organizationId',
        organization1Id,
      );

      // then
      expect(organizationProfileReward).lengthOf(0);
    });

    it('should not process profileReward outside date range', async function () {
      // given
      const { id: learner1Id, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization1Id,
      });
      const { id: learner2Id } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization2Id,
        userId: userId,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization1Id,
        targetProfileId: targetProfile1Id,
      });
      const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization2Id,
        targetProfileId: targetProfile2Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learner1Id,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2Id,
        organizationLearnerId: learner2Id,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation1Id,
        createdAt: new Date('2023-01-01'),
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation2Id,
        createdAt: new Date('2025-06-01'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ logger, options: { dryRun: false, startDate: '2024-01-01', endDate: '2025-01-01' } });

      const organizationProfileReward = await knex('organizations-profile-rewards');

      // then
      expect(organizationProfileReward).lengthOf(0);
    });

    it('should process profileReward inside date range', async function () {
      // given
      const { id: learner1Id, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization1Id,
      });
      const { id: learner2Id } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization2Id,
        userId: userId,
      });
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization1Id,
        targetProfileId: targetProfile1Id,
      });
      const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization2Id,
        targetProfileId: targetProfile2Id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        organizationLearnerId: learner1Id,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2Id,
        organizationLearnerId: learner2Id,
        userId: userId,
        status: CampaignParticipationStatuses.SHARED,
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation1Id,
        createdAt: new Date('2024-01-01'),
      });
      databaseBuilder.factory.buildProfileReward({
        userId: userId,
        rewardId: attestation2Id,
        createdAt: new Date('2024-12-01'),
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ logger, options: { dryRun: false, startDate: '2024-01-01', endDate: '2025-01-01' } });

      const organizationProfileReward = await knex('organizations-profile-rewards');

      // then
      expect(organizationProfileReward).lengthOf(2);
    });
  });
});
