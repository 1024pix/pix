import { expect, databaseBuilder, mockLearningContent } from '../../../test-helper';
import campaignParticipationResultRepository from '../../../../lib/infrastructure/repositories/campaign-participation-result-repository';
import KnowledgeElement from '../../../../lib/domain/models/KnowledgeElement';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';

const { STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign Participation Result', function () {
  describe('#getByParticipationId', function () {
    let targetProfileId;

    beforeEach(function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      const learningContent = {
        areas: [
          { id: 'recArea1', name: 'area1', competenceIds: ['rec1'], color: 'colorArea1' },
          { id: 'recArea2', name: 'area2', competenceIds: ['rec2'], color: 'colorArea2' },
        ],
        competences: [
          {
            id: 'rec1',
            name_i18n: {
              fr: 'comp1Fr',
              en: 'comp1En',
            },
            index: '1.1',
            areaId: 'recArea1',
            color: 'rec1Color',
            skillIds: ['skill1', 'skill2'],
          },
          {
            id: 'rec2',
            name_i18n: {
              fr: 'comp2Fr',
              en: 'comp2En',
            },
            index: '2.1',
            areaId: 'recArea2',
            color: 'rec2Color',
            skillIds: ['skill3', 'skill4', 'skill5'],
          },
        ],
        tubes: [
          { id: 'recTube1', competenceId: 'rec1' },
          { id: 'recTube2', competenceId: 'rec2' },
        ],
        skills: [
          { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1' }, // skill previously validated in competence 1
          { id: 'skill2', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1' }, // skill validated in competence 1
          { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' }, // skill invalidated in competence 2
          { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' }, // skill not tested
          { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' }, // skill not in target profile
        ],
      };

      mockLearningContent(learningContent);
      return databaseBuilder.commit();
    });

    it('use the most recent assessment to define if the participation is completed', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      _buildCampaignSkills(campaignId);
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId,
        state: 'started',
        createdAt: new Date('2021-01-01'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId,
        state: 'completed',
        createdAt: new Date('2021-01-02'),
      });
      await databaseBuilder.commit();

      const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(
        campaignParticipationId
      );

      expect(campaignAssessmentParticipationResult).to.deep.include({
        isCompleted: true,
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      _buildCampaignSkills(campaignId);
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId,
        state: 'completed',
        type: 'CAMPAIGN',
      });
      const knowledgeElementsAttributes = [
        {
          userId,
          skillId: 'skill1',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
        {
          userId,
          assessmentId,
          skillId: 'skill3',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        },
        {
          userId,
          skillId: 'skill5',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
      ];
      databaseBuilder.factory.knowledgeElementSnapshotFactory.buildSnapshot({
        userId,
        snappedAt: new Date('2020-01-02'),
        knowledgeElementsAttributes,
      });
      await databaseBuilder.commit();
      const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(
        campaignParticipationId
      );

      expect(campaignAssessmentParticipationResult).to.deep.include({
        id: campaignParticipationId,
        knowledgeElementsCount: 2,
        testedSkillsCount: 2,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    it('computes the results for each competence assessed', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      _buildCampaignSkills(campaignId);
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId,
        state: 'completed',
        type: 'CAMPAIGN',
      });

      const knowledgeElementsAttributes = [
        {
          userId,
          skillId: 'skill1',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
        {
          userId,
          assessmentId,
          skillId: 'skill2',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
        {
          userId,
          assessmentId,
          skillId: 'skill3',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        },
      ];

      databaseBuilder.factory.knowledgeElementSnapshotFactory.buildSnapshot({
        userId,
        snappedAt: new Date('2020-01-02'),
        knowledgeElementsAttributes,
      });
      await databaseBuilder.commit();
      const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(
        campaignParticipationId
      );
      const competenceResults = campaignAssessmentParticipationResult.competenceResults.sort((a, b) => a.id <= b.id);
      expect(competenceResults).to.deep.equal([
        {
          id: 'rec1',
          name: 'comp1Fr',
          index: '1.1',
          areaName: 'area1',
          areaColor: 'colorArea1',
          testedSkillsCount: 2,
          totalSkillsCount: 2,
          validatedSkillsCount: 2,
        },
        {
          id: 'rec2',
          name: 'comp2Fr',
          index: '2.1',
          areaName: 'area2',
          areaColor: 'colorArea2',
          testedSkillsCount: 1,
          totalSkillsCount: 2,
          validatedSkillsCount: 0,
        },
      ]);
    });

    context('when there is no snapshot because the participant did not share his results', function () {
      it('compute results by using knowledge elements', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: STARTED,
          sharedAt: null,
        });

        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId,
          state: 'completed',
          type: 'CAMPAIGN',
        });
        const knowledgeElementsAttributes = [
          {
            userId,
            skillId: 'skill1',
            competenceId: 'rec1',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
          {
            userId,
            assessmentId,
            skillId: 'skill2',
            competenceId: 'rec1',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.INVALIDATED,
          },
          {
            userId,
            skillId: 'skill5',
            competenceId: 'rec2',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
        ];
        knowledgeElementsAttributes.forEach((attributes) => databaseBuilder.factory.buildKnowledgeElement(attributes));
        await databaseBuilder.commit();
        const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(
          campaignParticipationId
        );

        expect(campaignAssessmentParticipationResult).to.deep.include({
          id: campaignParticipationId,
          knowledgeElementsCount: 2,
          testedSkillsCount: 2,
          totalSkillsCount: 4,
          validatedSkillsCount: 1,
        });
      });
    });

    context('when the target profile has some stages', function () {
      it('returns the stage reached', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
        });

        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId,
          state: 'completed',
          type: 'CAMPAIGN',
        });
        databaseBuilder.factory.buildStage({
          id: 10,
          title: 'StageO',
          message: 'Message0',
          targetProfileId,
          threshold: 0,
        });
        databaseBuilder.factory.buildStage({
          id: 1,
          title: 'Stage1',
          message: 'Message1',
          targetProfileId,
          threshold: 10,
        });
        databaseBuilder.factory.buildStage({
          id: 2,
          title: 'Stage2',
          message: 'Message2',
          targetProfileId,
          threshold: 50,
        });
        databaseBuilder.factory.buildStage({
          id: 3,
          title: 'Stage3',
          message: 'Message3',
          targetProfileId,
          threshold: 100,
        });

        const knowledgeElementsAttributes = [
          {
            userId,
            skillId: 'skill1',
            competenceId: 'rec1',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
          {
            userId,
            assessmentId,
            skillId: 'skill2',
            competenceId: 'rec1',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
          {
            userId,
            assessmentId,
            skillId: 'skill3',
            competenceId: 'rec2',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.INVALIDATED,
          },
        ];

        databaseBuilder.factory.knowledgeElementSnapshotFactory.buildSnapshot({
          userId,
          snappedAt: new Date('2020-01-02'),
          knowledgeElementsAttributes,
        });
        await databaseBuilder.commit();
        const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(
          campaignParticipationId
        );
        expect(campaignAssessmentParticipationResult.reachedStage).to.deep.include({
          id: 2,
          message: 'Message2',
          starCount: 3,
          threshold: 50,
          title: 'Stage2',
        });
        expect(campaignAssessmentParticipationResult.stageCount).to.equal(4);
      });
    });
  });
});

function _buildCampaignSkills(campaignId) {
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill1' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill2' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill3' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill4' });
}
