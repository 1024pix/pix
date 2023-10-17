import {
  expect,
  catchErr,
  databaseBuilder,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { usecases } from '../../../../lib/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError, NoStagesForCampaign } from '../../../../lib/domain/errors.js';

describe('Integration | UseCase | get-campaign-participations-counts-by-stage', function () {
  let organizationId;
  let campaignId;
  let userId;
  let stage1, stage2, stage3;
  let campaignParticipation1, campaignParticipation2, campaignParticipation3, campaignParticipation4;

  beforeEach(async function () {
    const learningContentObjects = learningContentBuilder.fromAreas([
      {
        id: 'recArea1',
        title_i18n: {
          fr: 'area1_Title',
        },
        color: 'specialColor',
        competences: [
          {
            id: 'recCompetence1',
            name: 'Fabriquer un meuble',
            index: '1.1',
            tubes: [
              {
                id: 'recTube1',
                skills: [
                  { id: 'recSkillId1', nom: '@web1', challenges: [] },
                  { id: 'recSkillId2', nom: '@web2', challenges: [] },
                  { id: 'recSkillId3', nom: '@web3', challenges: [] },
                  { id: 'recSkillId4', nom: '@web4', challenges: [] },
                ],
              },
            ],
          },
        ],
      },
    ]);
    mockLearningContent(learningContentObjects);

    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildMembership({ organizationId, userId });
    stage1 = databaseBuilder.factory.buildStage({
      targetProfileId,
      threshold: 0,
      prescriberTitle: 'title',
      prescriberDescription: 'desc',
    });
    stage2 = databaseBuilder.factory.buildStage({ targetProfileId, threshold: 30 });
    stage3 = databaseBuilder.factory.buildStage({ targetProfileId, threshold: 70 });
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId }).id;
    campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
    campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
    campaignParticipation3 = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
    campaignParticipation4 = databaseBuilder.factory.buildCampaignParticipation({ campaignId });

    await databaseBuilder.commit();
  });

  context('when requesting user is not allowed to access campaign informations', function () {
    it('should throw a UserNotAuthorizedToAccessEntityError error', async function () {
      const user2 = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.getCampaignParticipationsCountByStage)({
        userId: user2.id,
        campaignId,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      expect(error.message).to.equal('User does not belong to the organization that owns the campaign');
    });
  });

  context('when the campaign has no stages', function () {
    it('should throw a NoStagesForCampaign error', async function () {
      // given
      const campaign2 = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign2.id, skillId: 'recSkillId1' });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.getCampaignParticipationsCountByStage)({
        userId,
        campaignId: campaign2.id,
      });

      // then
      expect(error).to.be.instanceOf(NoStagesForCampaign);
      expect(error.message).to.equal('The campaign does not have stages.');
    });
  });

  context('when the campaign has stages', function () {
    it('should return acquisitions counts by stages', async function () {
      // given
      [
        // campaignParticipation1
        {
          stageId: stage1.id,
          campaignParticipationId: campaignParticipation1.id,
        },
        {
          stageId: stage2.id,
          campaignParticipationId: campaignParticipation1.id,
        },
        {
          stageId: stage3.id,
          campaignParticipationId: campaignParticipation1.id,
        },
        // campaignParticipation2
        {
          stageId: stage1.id,
          campaignParticipationId: campaignParticipation2.id,
        },
        {
          stageId: stage2.id,
          campaignParticipationId: campaignParticipation2.id,
        },
        // campaignParticipation3
        {
          stageId: stage1.id,
          campaignParticipationId: campaignParticipation3.id,
        },
        // campaignParticipation4
        {
          stageId: stage1.id,
          campaignParticipationId: campaignParticipation4.id,
        },
        {
          stageId: stage2.id,
          campaignParticipationId: campaignParticipation4.id,
        },
      ].map(databaseBuilder.factory.buildStageAcquisition);

      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignParticipationsCountByStage({ userId, campaignId });

      // then
      expect(result).to.deep.equal([
        {
          id: stage1.id,
          value: 1,
          title: stage1.prescriberTitle,
          description: stage1.prescriberDescription,
          reachedStage: 1,
          totalStage: 3,
        },
        { id: stage2.id, value: 2, title: null, description: null, reachedStage: 2, totalStage: 3 },
        { id: stage3.id, value: 1, title: null, description: null, reachedStage: 3, totalStage: 3 },
      ]);
    });

    it('should set to 0 all participation counts when no stage acquisitions', async function () {
      // when
      const result = await usecases.getCampaignParticipationsCountByStage({ userId, campaignId });

      // then
      expect(result).to.deep.equal([
        {
          id: stage1.id,
          value: 0,
          title: stage1.prescriberTitle,
          description: stage1.prescriberDescription,
          reachedStage: 1,
          totalStage: 3,
        },
        { id: stage2.id, value: 0, title: null, description: null, reachedStage: 2, totalStage: 3 },
        { id: stage3.id, value: 0, title: null, description: null, reachedStage: 3, totalStage: 3 },
      ]);
    });
  });
});
