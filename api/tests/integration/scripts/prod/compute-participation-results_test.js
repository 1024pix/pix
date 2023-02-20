import { expect, mockLearningContent, databaseBuilder, knex } from '../../../test-helper';
import computeParticipationResults from '../../../../scripts/prod/compute-participation-results';
import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';

const { STARTED } = CampaignParticipationStatuses;

describe('computeParticipationResults', function () {
  context('when there is one campaign participation on profile collection campaign', function () {
    it('computes results using all knowledge elements', async function () {
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

      _buildParticipationWithSnapshot({ campaignId, sharedAt: new Date('2020-01-02') }, [
        { skillId: 'skill_1', competenceId: 'competence_1', status: 'invalidated', earnedPix: 0 },
        { skillId: 'skill_2', competenceId: 'competence_2', status: 'validated', earnedPix: 3 },
        { skillId: 'skill_3', competenceId: 'competence_3', status: 'validated', earnedPix: 1 },
      ]);

      await databaseBuilder.commit();

      const learningContent = {
        skills: [
          { id: 'skill_1', competenceId: 'competence_1', status: 'actif' },
          { id: 'skill_2', competenceId: 'competence_2', status: 'actif' },
          { id: 'skill_3', competenceId: 'competence_3', status: 'actif' },
        ],
        competences: [
          { id: 'competence_1', origin: 'Pix' },
          { id: 'competence_2', origin: 'Pix' },
          { id: 'competence_3', origin: 'Pix' },
        ],
      };
      mockLearningContent(learningContent);

      await computeParticipationResults(1, false);

      const campaignParticipation = await knex('campaign-participations').first();

      expect(campaignParticipation.masteryRate).to.equals('0.01');
      expect(campaignParticipation.pixScore).to.equals(4);
      expect(campaignParticipation.validatedSkillsCount).to.equals(2);
      expect(campaignParticipation.isCertifiable).to.be.false;
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
        competences: [],
      };
      mockLearningContent(learningContent);

      await computeParticipationResults(1, false);

      const campaignParticipation = await knex('campaign-participations').first();

      expect(campaignParticipation.masteryRate).to.equals('1.00');
      expect(campaignParticipation.pixScore).to.equals(5);
      expect(campaignParticipation.validatedSkillsCount).to.equals(1);
      expect(campaignParticipation.isCertifiable).to.be.null;
    });
  });

  context('when there are campaign participation', function () {
    context('when there are several campaign participation', function () {
      it('computes results for each participation', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

        _buildParticipationWithSnapshot({ id: 1, campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', status: 'validated', earnedPix: 4 },
        ]);

        _buildParticipationWithSnapshot({ id: 2, campaignId, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', competenceId: 'competence_1', status: 'validated', earnedPix: 8 },
          { skillId: 'skill_2', competenceId: 'competence_2', status: 'validated', earnedPix: 8 },
          { skillId: 'skill_3', competenceId: 'competence_3', status: 'validated', earnedPix: 8 },
          { skillId: 'skill_4', competenceId: 'competence_4', status: 'validated', earnedPix: 8 },
          { skillId: 'skill_5', competenceId: 'competence_5', status: 'validated', earnedPix: 8 },
        ]);

        await databaseBuilder.commit();

        const learningContent = {
          skills: [
            { id: 'skill_1', competenceId: 'competence_1', status: 'actif' },
            { id: 'skill_2', competenceId: 'competence_2', status: 'actif' },
            { id: 'skill_3', competenceId: 'competence_3', status: 'actif' },
            { id: 'skill_4', competenceId: 'competence_4', status: 'actif' },
            { id: 'skill_5', competenceId: 'competence_5', status: 'actif' },
          ],
          competences: [
            { id: 'competence_1', origin: 'Pix' },
            { id: 'competence_2', origin: 'Pix' },
            { id: 'competence_3', origin: 'Pix' },
            { id: 'competence_4', origin: 'Pix' },
            { id: 'competence_5', origin: 'Pix' },
          ],
        };
        mockLearningContent(learningContent);

        await computeParticipationResults(1, false);
        const campaignParticipations = await knex('campaign-participations')
          .select(['validatedSkillsCount', 'pixScore', 'masteryRate', 'isCertifiable'])
          .orderBy('id');

        expect(campaignParticipations).to.deep.equals([
          { validatedSkillsCount: 1, pixScore: 4, masteryRate: '0.01', isCertifiable: false },
          { validatedSkillsCount: 5, pixScore: 40, masteryRate: '0.06', isCertifiable: true },
        ]);
      });
    });

    context('when there are campaign participation for the several campaigns', function () {
      it('computes results for each participation', async function () {
        const { id: campaignId1 } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
        const { id: campaignId2 } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

        _buildParticipationWithSnapshot({ id: 1, campaignId: campaignId1, sharedAt: new Date('2020-01-02') }, [
          { skillId: 'skill_1', competenceId: 'C1', status: 'validated', earnedPix: 40 },
          { skillId: 'skill_2', competenceId: 'C2', status: 'validated', earnedPix: 40 },
        ]);

        _buildParticipationWithSnapshot({ id: 2, campaignId: campaignId2, sharedAt: new Date('2020-01-03') }, [
          { skillId: 'skill_1', status: 'validated', earnedPix: 40 },
        ]);

        await databaseBuilder.commit();

        mockLearningContent({ skills: [], competences: [] });

        await computeParticipationResults(1, false);
        const campaignParticipations = await knex('campaign-participations')
          .select(['validatedSkillsCount', 'pixScore', 'masteryRate', 'isCertifiable'])
          .orderBy('id');

        expect(campaignParticipations).to.deep.equals([
          { validatedSkillsCount: 2, pixScore: 80, masteryRate: '0.13', isCertifiable: false },
          { validatedSkillsCount: 1, pixScore: 40, masteryRate: '0.06', isCertifiable: false },
        ]);
      });
    });

    context(
      'when there are campaign participation on profiles collection campaign with isCertifiable already computed',
      function () {
        it('does not compute results', async function () {
          const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            sharedAt: new Date('2020-01-02'),
            validatedSkillsCount: 10,
            masteryRate: 0.2,
            pixScore: 10,
            isCertifiable: true,
          });

          await databaseBuilder.commit();

          mockLearningContent({ skills: [], competences: [] });

          await computeParticipationResults(1, false);

          const campaignParticipation = await knex('campaign-participations').first();

          expect(campaignParticipation.masteryRate).to.equals('0.20');
          expect(campaignParticipation.pixScore).to.equals(10);
          expect(campaignParticipation.validatedSkillsCount).to.equals(10);
          expect(campaignParticipation.isCertifiable).to.be.true;
        });
      }
    );

    context('when there are campaign participation on assessment campaign with pixScore already computed', function () {
      it('does not compute results', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });

        databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          sharedAt: new Date('2020-01-02'),
          validatedSkillsCount: 10,
          masteryRate: 0.2,
          pixScore: 10,
          isCertifiable: null,
        });

        await databaseBuilder.commit();

        mockLearningContent({ skills: [], competences: [] });

        await computeParticipationResults(1, false);

        const campaignParticipation = await knex('campaign-participations').first();

        expect(campaignParticipation.masteryRate).to.equals('0.20');
        expect(campaignParticipation.pixScore).to.equals(10);
        expect(campaignParticipation.validatedSkillsCount).to.equals(10);
        expect(campaignParticipation.isCertifiable).to.be.null;
      });
    });

    context('when there are campaign participation not shared', function () {
      it('does not compute results', async function () {
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

        databaseBuilder.factory.buildCampaignParticipation({ campaignId, status: STARTED });

        await databaseBuilder.commit();

        mockLearningContent({ skills: [] });

        await computeParticipationResults(1, false);

        const campaignParticipation = await knex('campaign-participations').first();

        expect(campaignParticipation.masteryRate).to.equals(null);
        expect(campaignParticipation.pixScore).to.equals(null);
        expect(campaignParticipation.validatedSkillsCount).to.equals(null);
        expect(campaignParticipation.isCertifiable).to.be.null;
      });
    });
  });
});

function _buildCampaignForSkills(skillIds) {
  const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
  const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId });

  skillIds.forEach((skillId) => {
    databaseBuilder.factory.buildCampaignSkill({ skillId, campaignId: campaign.id });
  });
  return campaign;
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
