import sinon from 'sinon';

import { CombinedCourseStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import {
  CampaignCombinedCourseItem,
  ModuleCombinedCourseItem,
  TrainingCombinedCourseItem,
} from '../../../../../src/quest/domain/models/combined-course-participations/value-objects/CombinedCourseItem.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-courses/entities/CombinedCourse.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import combinedCourseDetailsService from '../../../../../src/quest/domain/services/combined-course-details-service.js';
import { repositories } from '../../../../../src/quest/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { injectDependencies } from '../../../../../src/shared/infrastructure/utils/dependency-injection.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const { combinedCourseDetailsService: CombinedCourseDetailsService } = injectDependencies(
  { combinedCourseDetailsService },
  {
    combinedCourseParticipationRepository: repositories.combinedCourseParticipationRepository,
    combinedCourseRepository: repositories.combinedCourseRepository,
    campaignRepository: repositories.campaignRepository,
    questRepository: repositories.questRepository,
    moduleRepository: repositories.moduleRepository,
    eligibilityRepository: repositories.eligibilityRepository,
    recommendedModuleRepository: repositories.recommendedModuleRepository,
  },
);

describe('Integration | Quest | Domain | Services | CombinedCourseDetailsService', function () {
  let code, combinedCourseUrl;
  beforeEach(function () {
    code = 'SOMETHING';
    combinedCourseUrl = '/parcours/' + code;

    sinon.stub(cryptoService, 'encrypt');
    cryptoService.encrypt.withArgs(combinedCourseUrl).resolves('encryptedUrl');
  });

  it('should throw an error if CombinedCourse does not exist', async function () {
    const error = await catchErr(CombinedCourseDetailsService.instantiateCombinedCourseDetails)({
      combinedCourseId: 123,
    });

    expect(error).to.be.instanceOf(NotFoundError);
  });

  describe('when there is a combined course', function () {
    let organizationLearnerId, userId, organizationId;
    let targetProfile, campaign;
    let training1, training2;

    const moduleId1 = '6282925d-4775-4bca-b513-4c3009ec5886';
    const moduleId2 = '654c44dc-0560-4acc-9860-4a67c923577f';
    const moduleId3 = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';

    beforeEach(function () {
      // given
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      organizationLearnerId = organizationLearner.id;
      userId = organizationLearner.userId;
      organizationId = organizationLearner.organizationId;

      targetProfile = databaseBuilder.factory.buildTargetProfile();
      campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

      training1 = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' });
      training2 = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bases-clavier-1' });
    });

    it('should return not started combined course', async function () {
      // given
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId1 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId2 }).toDTO(),
        ],
      });
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId,
      });

      await databaseBuilder.commit();

      // when
      const combinedCourseDetails = await CombinedCourseDetailsService.instantiateCombinedCourseDetails({
        combinedCourseId,
      });
      const result = await CombinedCourseDetailsService.getCombinedCourseDetails({
        organizationLearnerId,
        combinedCourseDetails,
      });

      // then
      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.items).to.be.deep.equal([
        {
          id: campaign.id,
          reference: campaign.code,
          title: campaign.title,
          masteryRate: null,
          redirection: undefined,
          participationStatus: undefined,
          isCompleted: false,
          isLocked: false,
          duration: undefined,
          image: undefined,
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
      expect(result.status).to.equal(CombinedCourseStatuses.NOT_STARTED);
      expect(result.items[0]).instanceOf(CampaignCombinedCourseItem);
      expect(result.items[1]).instanceOf(ModuleCombinedCourseItem);
      expect(result.items[2]).instanceOf(ModuleCombinedCourseItem);
    });

    it('should return started combined course', async function () {
      // given
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
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
        questId,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        combinedCourseId,
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
        status: CampaignParticipationStatuses.SHARED,
        masteryRate: 0.5,
      });

      const stage = databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildStageAcquisition({
        campaignParticipationId: campaignParticipation.id,
        stageId: stage.id,
      });

      databaseBuilder.factory.buildTraining({
        type: 'modulix',
        link: '/modules/bien-ecrire-son-adresse-mail',
      });
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

      await databaseBuilder.commit();

      // when
      const combinedCourseDetails = await CombinedCourseDetailsService.instantiateCombinedCourseDetails({
        combinedCourseId,
      });
      const result = await CombinedCourseDetailsService.getCombinedCourseDetails({
        combinedCourseDetails,
        organizationLearnerId,
      });

      // then
      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.items).to.be.deep.equal([
        {
          id: campaign.id,
          reference: campaign.code,
          title: campaign.title,
          masteryRate: 0.5,
          redirection: undefined,
          participationStatus: CampaignParticipationStatuses.SHARED,
          isCompleted: true,
          isLocked: false,
          duration: undefined,
          image: undefined,
          totalStagesCount: 1,
          validatedStagesCount: 1,
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
          participationStatus: undefined,
          isCompleted: false,
          isLocked: false,
          duration: 10,
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          shortId: '9d4dcab8',
        },
      ]);

      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(CombinedCourseStatuses.STARTED);
      expect(result.items[0]).instanceOf(CampaignCombinedCourseItem);
      expect(result.items[1]).instanceOf(ModuleCombinedCourseItem);
      expect(result.items[2]).instanceOf(ModuleCombinedCourseItem);
      expect(result.surveyLink).to.equal();
    });

    it('should return independent states for each learner when processing multiple learners', async function () {
      // given
      const secondLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId1 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: moduleId2 }).toDTO(),
        ],
      });
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        questId,
      });

      // First learner: STARTED combined course + SHARED campaign participation (campaign item completed)
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        combinedCourseId,
        organizationLearnerId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
        masteryRate: 0.8,
        status: CampaignParticipationStatuses.SHARED,
      });

      // Second learner: STARTED combined course + STARTED campaign participation (campaign item not completed)
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        combinedCourseId,
        organizationLearnerId: secondLearner.id,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: secondLearner.userId,
        organizationLearnerId: secondLearner.id,
        masteryRate: null,
        status: CampaignParticipationStatuses.STARTED,
      });

      await databaseBuilder.commit();

      // when
      const combinedCourseDetails = await CombinedCourseDetailsService.instantiateCombinedCourseDetails({
        combinedCourseId,
      });
      const resultsByLearnerId = await CombinedCourseDetailsService.getCombinedCourseDetailsForMultipleLearners({
        organizationLearnerIds: [organizationLearnerId, secondLearner.id],
        combinedCourseDetails,
      });

      // then
      expect(resultsByLearnerId).instanceOf(Map);
      expect(resultsByLearnerId.size).equal(2);
      const firstLearnerResult = resultsByLearnerId.get(organizationLearnerId);
      expect(firstLearnerResult.status).to.equal(CombinedCourseStatuses.STARTED);
      expect(firstLearnerResult.participation).not.to.equal(null);
      expect(firstLearnerResult.items).to.have.lengthOf(3);
      expect(firstLearnerResult.items[0].participationStatus).to.equal(CampaignParticipationStatuses.SHARED);
      expect(firstLearnerResult.items[0].isCompleted).to.equal(true);

      const secondLearnerResult = resultsByLearnerId.get(secondLearner.id);
      expect(secondLearnerResult.status).to.equal(CombinedCourseStatuses.STARTED);
      expect(secondLearnerResult.participation).not.to.equal(null);
      expect(secondLearnerResult.items).to.have.lengthOf(3);
      expect(secondLearnerResult.items[0].participationStatus).to.equal(CampaignParticipationStatuses.STARTED);
      expect(secondLearnerResult.items[0].isCompleted).to.equal(false);
    });
  });

  describe('when there is no combined course participation yet', function () {
    it('should return correct data for a not started combined course participation', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
      const { id: organizationLearnerId } = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

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

      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
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
        questId,
      });

      await databaseBuilder.commit();

      // when
      const combinedCourseDetails = await CombinedCourseDetailsService.instantiateCombinedCourseDetails({
        combinedCourseId,
      });
      const result = await CombinedCourseDetailsService.getCombinedCourseDetails({
        combinedCourseDetails,
        organizationLearnerId,
      });

      // then
      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(CombinedCourseStatuses.NOT_STARTED);
      expect(result.items[0]).instanceOf(CampaignCombinedCourseItem);
      expect(result.items[1]).instanceOf(TrainingCombinedCourseItem);
      expect(result.items[2]).instanceOf(ModuleCombinedCourseItem);
    });
  });
});
