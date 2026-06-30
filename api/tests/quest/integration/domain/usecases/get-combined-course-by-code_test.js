import nock from 'nock';
import sinon from 'sinon';

import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseDetails } from '../../../../../src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js';
import { CombinedCourseReward } from '../../../../../src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseReward.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import {
  CampaignCombinedCourseItem,
  ModuleCombinedCourseItem,
  TrainingCombinedCourseItem,
} from '../../../../../src/quest/domain/models/combined-course-participations/value-objects/CombinedCourseItem.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-courses/entities/CombinedCourse.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Quest | Domain | UseCases | get-combined-course-by-code', function () {
  let combinedCourseUrl, code;

  beforeEach(function () {
    code = 'SOMETHING';
    combinedCourseUrl = '/parcours/' + code;

    sinon.stub(cryptoService, 'encrypt');
    cryptoService.encrypt.withArgs(combinedCourseUrl).resolves('encryptedUrl');
  });

  it('should throw an error if CombinedCourse does not exist', async function () {
    const code = 'NOTHINGTT';

    const error = await catchErr(usecases.getCombinedCourseByCode)({ code });

    expect(error).to.be.instanceOf(NotFoundError);
  });

  describe('when there is a combined course participation', function () {
    it('should return CombinedCourse for provided code', async function () {
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
        status: CampaignParticipationStatuses.STARTED,
      });
      databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' });
      databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bases-clavier-1' });
      const moduleId1 = '6282925d-4775-4bca-b513-4c3009ec5886';
      const moduleId2 = '654c44dc-0560-4acc-9860-4a67c923577f';

      const { id: questId1 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId1 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId2 }).toDTO(),
        ],
      });
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId: questId1,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        combinedCourseId,
      });

      await databaseBuilder.commit();

      const result = await usecases.getCombinedCourseByCode({ code, userId });

      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.items).to.be.deep.equal([
        {
          id: campaign.id,
          reference: campaign.code,
          title: campaign.title,
          redirection: undefined,
          participationStatus: CampaignParticipationStatuses.STARTED,
          isCompleted: false,
          isLocked: false,
          duration: undefined,
          image: undefined,
          masteryRate: null,
          totalStagesCount: null,
          validatedStagesCount: null,
        },
        {
          id: moduleId1,
          reference: 'bac-a-sable',
          title: 'Bac à sable',
          redirection: 'encryptedUrl',
          participationStatus: undefined,
          isCompleted: false,
          isLocked: true,
          duration: 5,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          shortId: '6a68bf32',
        },
        {
          id: moduleId2,
          reference: 'bases-clavier-1',
          title: 'Les bases du clavier sur ordinateur 1/2',
          redirection: 'encryptedUrl',
          participationStatus: undefined,
          isCompleted: false,
          isLocked: true,
          duration: 30,
          image: 'https://assets.pix.org/modules/1emarche-clavier1/picto-1eremarche_clavier1.svg',
          shortId: '740d5aa9',
        },
      ]);
      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);
      expect(result.items[0]).instanceOf(CampaignCombinedCourseItem);
      expect(result.items[1]).instanceOf(ModuleCombinedCourseItem);
      expect(result.items[2]).instanceOf(ModuleCombinedCourseItem);
    });

    it('should return started combined course for given userId', async function () {
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
        status: CampaignParticipationStatuses.SHARED,
        masteryRate: 0.5,
      });
      const training1 = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' });
      const training2 = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bases-clavier-1' });
      databaseBuilder.factory.buildTraining({
        type: 'modulix',
        link: '/modules/bien-ecrire-son-adresse-mail',
      });
      const moduleId1 = '6282925d-4775-4bca-b513-4c3009ec5886';
      const moduleId2 = '654c44dc-0560-4acc-9860-4a67c923577f';
      const moduleId3 = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
      databaseBuilder.factory.buildTargetProfileTraining({
        targetProfileId: targetProfile.id,
        trainingId: training1.id,
      });
      databaseBuilder.factory.buildTargetProfileTraining({
        targetProfileId: targetProfile.id,
        trainingId: training2.id,
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId,
        trainingId: training1.id,
        campaignParticipationId: campaignParticipation.id,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        moduleId: moduleId1,
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
        moduleId: moduleId3,
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.NOT_STARTED,
      });

      const { id: questId2 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId1 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId2 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId3 }).toDTO(),
        ],
      });
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId: questId2,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        combinedCourseId,
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });

      await databaseBuilder.commit();

      const result = await usecases.getCombinedCourseByCode({ code, userId });

      expect(result.items).to.be.deep.equal([
        {
          id: campaign.id,
          reference: campaign.code,
          title: campaign.title,
          masteryRate: 0.5,
          validatedStagesCount: 0,
          totalStagesCount: 0,
          redirection: undefined,
          participationStatus: CampaignParticipationStatuses.SHARED,
          isCompleted: true,
          isLocked: false,
          duration: undefined,
          image: undefined,
        },
        {
          id: moduleId1,
          reference: 'bac-a-sable',
          title: 'Bac à sable',
          redirection: 'encryptedUrl',
          participationStatus: OrganizationLearnerParticipationStatuses.COMPLETED,
          isCompleted: true,
          isLocked: false,
          duration: 5,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          shortId: '6a68bf32',
        },
        {
          id: moduleId3,
          reference: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire une adresse mail',
          redirection: 'encryptedUrl',
          participationStatus: OrganizationLearnerParticipationStatuses.NOT_STARTED,
          isCompleted: false,
          isLocked: false,
          duration: 10,
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          shortId: '9d4dcab8',
        },
      ]);
      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);
      expect(result.items[0]).instanceOf(CampaignCombinedCourseItem);
      expect(result.items[1]).instanceOf(ModuleCombinedCourseItem);
      expect(result.items[2]).instanceOf(ModuleCombinedCourseItem);
    });
  });
  describe('when there is no organization learner yet', function () {
    it('should return correct data for a not started combined course participation', async function () {
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
      const userId = databaseBuilder.factory.buildUser().id;

      const training1 = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' });
      const training2 = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bases-clavier-1' });
      databaseBuilder.factory.buildTraining({
        type: 'modulix',
        link: '/modules/bien-ecrire-son-adresse-mail',
      });
      const moduleId1 = '6282925d-4775-4bca-b513-4c3009ec5886';
      const moduleId2 = '654c44dc-0560-4acc-9860-4a67c923577f';
      const moduleId3 = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
      databaseBuilder.factory.buildTargetProfileTraining({
        targetProfileId: targetProfile.id,
        trainingId: training1.id,
      });
      databaseBuilder.factory.buildTargetProfileTraining({
        targetProfileId: targetProfile.id,
        trainingId: training2.id,
      });

      const { id: questId3 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId1 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId2 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId3 }).toDTO(),
        ],
      });
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId: questId3,
      });

      await databaseBuilder.commit();

      const result = await usecases.getCombinedCourseByCode({ code, userId });
      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(OrganizationLearnerParticipationStatuses.NOT_STARTED);
      expect(result.items[0]).instanceOf(CampaignCombinedCourseItem);
      expect(result.items[1]).instanceOf(TrainingCombinedCourseItem);
      expect(result.items[2]).instanceOf(ModuleCombinedCourseItem);
    });
  });

  describe('when there is no userId provided', function () {
    it('should return combined course without any progress related to user', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
      });

      await databaseBuilder.commit();

      const result = await usecases.getCombinedCourseByCode({ code, userId: null });
      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.id).to.equal(combinedCourseId);
    });
  });
  describe('when there is a reward', function () {
    it('should return a combined course details instance with a reward attribute', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const attestation = databaseBuilder.factory.buildAttestation();

      const quest = databaseBuilder.factory.buildQuestForCombinedCourse({
        rewardId: attestation.id,
        rewardType: 'attestations',
      });

      databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId: quest.id,
      });

      const profileReward = databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id });

      await databaseBuilder.commit();

      const result = await usecases.getCombinedCourseByCode({ code, userId: profileReward.userId });
      expect(result).to.be.instanceOf(CombinedCourseDetails);
      expect(result.reward).to.be.instanceOf(CombinedCourseReward);
      expect(result.reward.data.key).to.equal(attestation.key);
    });
    it('should return a combined course details instance with a reward not obtained', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const attestation = databaseBuilder.factory.buildAttestation();

      const quest = databaseBuilder.factory.buildQuestForCombinedCourse({
        rewardId: attestation.id,
        rewardType: 'attestations',
      });

      databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId: quest.id,
      });

      databaseBuilder.factory.buildUser({ id: 123 });

      await databaseBuilder.commit();

      const result = await usecases.getCombinedCourseByCode({ code, userId: 123 });
      expect(result).to.be.instanceOf(CombinedCourseDetails);
      expect(result.reward).to.be.instanceOf(CombinedCourseReward);
      expect(result.reward.data.key).to.equal(attestation.key);
    });
  });
});
