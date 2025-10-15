import { CombinedCourseStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/CombinedCourse.js';
import {
  COMBINED_COURSE_ITEM_TYPES,
  CombinedCourseItem,
} from '../../../../../src/quest/domain/models/CombinedCourseItem.js';
import combinedCourseDetailsService from '../../../../../src/quest/domain/services/combined-course-details-service.js';
import { repositories } from '../../../../../src/quest/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { injectDependencies } from '../../../../../src/shared/infrastructure/utils/dependency-injection.js';
import { catchErr, databaseBuilder, expect, nock, sinon } from '../../../../test-helper.js';

const { combinedCourseDetailsService: CombinedCourseDetailsService } = injectDependencies(
  { combinedCourseDetailsService },
  {
    combinedCourseParticipationRepository: repositories.combinedCourseParticipationRepository,
    combinedCourseRepository: repositories.combinedCourseRepository,
    campaignRepository: repositories.campaignRepository,
    questRepository: repositories.questRepository,
    moduleRepository: repositories.moduleRepository,
    eligibilityRepository: repositories.eligibilityRepository,
    recommendedModulesRepository: repositories.recommendedModulesRepository,
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
    const error = await catchErr(CombinedCourseDetailsService.getCombinedCourseDetails)({
      combinedCourseId: 123,
      userId: 123,
    });

    expect(error).to.be.instanceOf(NotFoundError);
  });
  describe('when there is a combined course participation', function () {
    it('should return combined course for given questId', async function () {
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
        status: 'STARTED',
      });
      databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' });
      databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bases-clavier-1' });
      const moduleId1 = '6282925d-4775-4bca-b513-4c3009ec5886';
      const moduleId2 = '654c44dc-0560-4acc-9860-4a67c923577f';

      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        successRequirements: [
          {
            requirement_type: 'campaignParticipations',
            comparison: 'all',
            data: {
              campaignId: {
                data: campaign.id,
                comparison: 'equal',
              },
              status: {
                data: 'SHARED',
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId1,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId2,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
        ],
      });

      await databaseBuilder.commit();

      const result = await CombinedCourseDetailsService.getCombinedCourseDetails({
        userId,
        combinedCourseId,
      });

      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.items).to.be.deep.equal([
        {
          id: campaign.id,
          reference: campaign.code,
          title: campaign.title,
          type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
          redirection: undefined,
          isCompleted: false,
          isLocked: false,
          duration: undefined,
          image: undefined,
        },
        {
          id: moduleId1,
          reference: 'bac-a-sable',
          title: 'Bac à sable',
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: false,
          isLocked: true,
          duration: 5,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
        },
        {
          id: moduleId2,
          reference: 'bases-clavier-1',
          title: 'Les bases du clavier sur ordinateur 1/2',
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: false,
          isLocked: true,
          duration: 10,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
        },
      ]);
      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(CombinedCourseStatuses.NOT_STARTED);
      expect(result.items[0]).instanceOf(CombinedCourseItem);
      expect(result.items[1]).instanceOf(CombinedCourseItem);
      expect(result.items[2]).instanceOf(CombinedCourseItem);
    });

    it('should return started combined course for given userId', async function () {
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId });
      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
        status: 'SHARED',
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
      databaseBuilder.factory.buildPassage({ moduleId: moduleId1, userId, terminatedAt: new Date() });

      const { id: combinedCourseId, questId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        successRequirements: [
          {
            requirement_type: 'campaignParticipations',
            comparison: 'all',
            data: {
              campaignId: {
                data: campaign.id,
                comparison: 'equal',
              },
              status: {
                data: 'SHARED',
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId1,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId2,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId3,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
        ],
      });

      databaseBuilder.factory.buildCombinedCourseParticipation({ questId, organizationLearnerId });

      await databaseBuilder.commit();

      const result = await CombinedCourseDetailsService.getCombinedCourseDetails({
        combinedCourseId,
        userId,
      });

      expect(result.items).to.be.deep.equal([
        {
          id: campaign.id,
          reference: campaign.code,
          title: campaign.title,
          type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
          redirection: undefined,
          isCompleted: true,
          isLocked: false,
          duration: undefined,
          image: undefined,
        },
        {
          id: moduleId1,
          reference: 'bac-a-sable',
          title: 'Bac à sable',
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: true,
          isLocked: false,
          duration: 5,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
        },
        {
          id: moduleId3,
          reference: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire une adresse mail',
          type: COMBINED_COURSE_ITEM_TYPES.MODULE,
          redirection: 'encryptedUrl',
          isCompleted: false,
          isLocked: false,
          duration: 10,
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        },
      ]);
      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(CombinedCourseStatuses.STARTED);
      expect(result.items[0]).instanceOf(CombinedCourseItem);
      expect(result.items[1]).instanceOf(CombinedCourseItem);
      expect(result.items[2]).instanceOf(CombinedCourseItem);
    });
  });

  describe('when there is no combined course participation yet', function () {
    it('should return correct data for a not started combined course participation', async function () {
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ ownerOrganizationId: organizationId });
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

      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code,
        organizationId,
        successRequirements: [
          {
            requirement_type: 'campaignParticipations',
            comparison: 'all',
            data: {
              campaignId: {
                data: campaign.id,
                comparison: 'equal',
              },
              status: {
                data: 'SHARED',
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId1,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId2,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId3,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
        ],
      });

      await databaseBuilder.commit();

      const result = await CombinedCourseDetailsService.getCombinedCourseDetails({ combinedCourseId, userId });
      expect(result).to.be.instanceOf(CombinedCourse);
      expect(result.id).to.equal(combinedCourseId);
      expect(result.status).to.equal(CombinedCourseStatuses.NOT_STARTED);
      expect(result.participation).to.equal(null);
      expect(result.items[0]).instanceOf(CombinedCourseItem);
      expect(result.items[1]).instanceOf(CombinedCourseItem);
      expect(result.items[2]).instanceOf(CombinedCourseItem);
    });
  });
});
