const { expect, mockLearningContent, databaseBuilder, knex } = require('../../../test-helper');
const computeParticipationResults = require('../../../../scripts/prod/compute-participation-results');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

const { STARTED } = CampaignParticipationStatuses;

describe('computeParticipationResults', function () {
  context('when there is one campaign participation on profile collection campaign', function () {
    it('computes results using all knowledge elements', async function () {
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

      _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
        { skillId: 'skill_1', status: 'invalidated', earnedPix: 0 },
        { skillId: 'skill_2', status: 'validated', earnedPix: 3 },
        { skillId: 'skill_3', status: 'validated', earnedPix: 1 },
      ]);

      await databaseBuilder.commit();

      mockLearningContent({ skills: [] });

      await computeParticipationResults(1, false);

      const campaignParticipation = await knex('campaign-participations').first();

      expect(campaignParticipation.masteryRate).to.equals('0.01');
      expect(campaignParticipation.pixScore).to.equals(4);
      expect(campaignParticipation.validatedSkillsCount).to.equals(2);
    });
  });

  context('when there is one campaign participation on assessment campaigns', function () {
    it('computes results on target skills', async function () {
      const { id: campaignId } = _buildCampaignForSkills(['skill_1']);

      _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
        { skillId: 'skill_1', status: 'validated', earnedPix: 5 },
        { skillId: 'skill_2', status: 'validated', earnedPix: 3 },
        { skillId: 'skill_3', status: 'validated', earnedPix: 1 },
      ]);

      await databaseBuilder.commit();

      const learningContent = {
        skills: [
          { id: 'skill_1', status: 'actif' },
          { id: 'skill_2', status: 'archivé' },
          { id: 'skill_3', status: 'périmé' },
        ],
      };
      mockLearningContent(learningContent);

      await computeParticipationResults(1, false);

      const campaignParticipation = await knex('campaign-participations').first();

      expect(campaignParticipation.masteryRate).to.equals('1.00');
      expect(campaignParticipation.pixScore).to.equals(5);
      expect(campaignParticipation.validatedSkillsCount).to.equals(1);
    });
  });

  context('when there are campaign participation', function () {
    context('when there are several campaign participation', function () {
      it('computes results for each participation', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

        _buildParticipationWithSnapshot({ id: 1, campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', status: 'validated', earnedPix: 40 },
        ]);

        _buildParticipationWithSnapshot({ id: 2, campaignId, sharedAt: new Date('2020-01-03') }, [
          { skillId: 'skill_1', status: 'invalidated', earnedPix: 0 },
        ]);

        await databaseBuilder.commit();

        mockLearningContent({ skills: [] });

        await computeParticipationResults(1, false);
        const campaignParticipations = await knex('campaign-participations')
          .select(['validatedSkillsCount', 'pixScore', 'masteryRate'])
          .orderBy('id');

        expect(campaignParticipations).to.deep.equals([
          { validatedSkillsCount: 1, pixScore: 40, masteryRate: '0.06' },
          { validatedSkillsCount: 0, pixScore: 0, masteryRate: '0.00' },
        ]);
      });
    });

    context('when there are campaign participation for the several campaigns', function () {
      it('computes results for each participation', async function () {
        const { id: campaignId1 } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });
        const { id: campaignId2 } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

        _buildParticipationWithSnapshot({ id: 1, campaignId: campaignId1, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', competenceId: 'C1', status: 'validated', earnedPix: 40 },
          { skillId: 'skill_2', competenceId: 'C2', status: 'validated', earnedPix: 40 },
        ]);

        _buildParticipationWithSnapshot({ id: 2, campaignId: campaignId2, sharedAt: new Date('2020-01-03') }, [
          { skillId: 'skill_1', status: 'validated', earnedPix: 40 },
        ]);

        await databaseBuilder.commit();

        mockLearningContent({ skills: [] });

        await computeParticipationResults(1, false);
        const campaignParticipations = await knex('campaign-participations')
          .select(['validatedSkillsCount', 'pixScore', 'masteryRate'])
          .orderBy('id');

        expect(campaignParticipations).to.deep.equals([
          { validatedSkillsCount: 2, pixScore: 80, masteryRate: '0.13' },
          { validatedSkillsCount: 1, pixScore: 40, masteryRate: '0.06' },
        ]);
      });
    });

    context('when there are campaign participation with already pix score computed', function () {
      it('does not compute results', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          sharedAt: new Date('2020-01-02'),
          validatedSkillsCount: 10,
          masteryRate: 0.2,
          pixScore: 10,
        });

        await databaseBuilder.commit();

        mockLearningContent({ skills: [] });

        await computeParticipationResults(1, false);

        const campaignParticipation = await knex('campaign-participations').first();

        expect(campaignParticipation.masteryRate).to.equals('0.20');
        expect(campaignParticipation.pixScore).to.equals(10);
        expect(campaignParticipation.validatedSkillsCount).to.equals(10);
      });
    });

    context('when there are campaign participation not shared', function () {
      it('does not compute results', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: Campaign.types.PROFILES_COLLECTION });

        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: STARTED });

        await databaseBuilder.commit();

        mockLearningContent({ skills: [] });

        await computeParticipationResults(1, false);

        const campaignParticipation = await knex('campaign-participations').first();

        expect(campaignParticipation.masteryRate).to.equals(null);
        expect(campaignParticipation.pixScore).to.equals(null);
        expect(campaignParticipation.validatedSkillsCount).to.equals(null);
      });
    });
  });
});

function _buildCampaignForSkills(skillIds) {
  const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

  skillIds.forEach((skillId) => {
    databaseBuilder.factory.buildTargetProfileSkill({ skillId, targetProfileId });
  });

  return databaseBuilder.factory.buildCampaign({ targetProfileId });
}

function _buildParticipationWithSnapshot(participationAttributes, knowledgeElementsAttributes) {
  const participation = databaseBuilder.factory.buildCampaignParticipation(participationAttributes);

  databaseBuilder.factory.knowledgeElementSnapshotFactory.buildSnapshot({
    userId: participation.userId,
    snappedAt: participation.sharedAt,
    knowledgeElementsAttributes,
  });

  return participation;
}
