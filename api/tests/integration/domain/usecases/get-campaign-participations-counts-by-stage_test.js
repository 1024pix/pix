import { expect, catchErr, databaseBuilder, learningContentBuilder, mockLearningContent } from '../../../test-helper';

import usecases from '../../../../lib/domain/usecases';
import { UserNotAuthorizedToAccessEntityError, NoStagesForCampaign } from '../../../../lib/domain/errors';

describe('Integration | UseCase | get-campaign-participations-counts-by-stage', function () {
  let organizationId;
  let campaignId;
  let userId;
  let stage1, stage2, stage3;

  beforeEach(async function () {
    const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas([
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
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId2' });
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId3' });
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId4' });
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

  context('when the campaign doesnt manage stages', function () {
    it('should throw a NoStagesForCampaign error', async function () {
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

  context('when the campaign manage stages', function () {
    it('should return participations counts by stages', async function () {
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.31 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.72 });
      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignParticipationsCountByStage({ userId, campaignId });

      // then
      expect(result).to.deep.equal([
        { id: stage1.id, value: 1, title: stage1.prescriberTitle, description: stage1.prescriberDescription },
        { id: stage2.id, value: 1, title: null, description: null },
        { id: stage3.id, value: 1, title: null, description: null },
      ]);
    });

    it('should set to 0 all participation counts when no participations', async function () {
      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignParticipationsCountByStage({ userId, campaignId });

      // then
      expect(result).to.deep.equal([
        { id: stage1.id, value: 0, title: stage1.prescriberTitle, description: stage1.prescriberDescription },
        { id: stage2.id, value: 0, title: null, description: null },
        { id: stage3.id, value: 0, title: null, description: null },
      ]);
    });
  });
});
