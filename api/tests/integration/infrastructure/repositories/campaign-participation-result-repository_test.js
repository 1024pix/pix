const { expect, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const campaignParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-result-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Integration | Repository | Campaign Participation Result', () => {

  describe('#getByParticipationId', () => {

    let targetProfileId;

    beforeEach(() => {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill3' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill4' });

      const learningContent = {
        areas: [
          { id: 'recArea1', name: 'area1', competenceIds: ['rec1'], color: 'colorArea1' },
          { id: 'recArea2', name: 'area2', competenceIds: ['rec2'], color: 'colorArea2' },
        ],
        competences: [
          { id: 'rec1', nameFrFr: 'comp1Fr', nameEnUs: 'comp1En', index: '1.1', areaId: 'recArea1', color: 'rec1Color', skillIds: ['skill1', 'skill2'] },
          { id: 'rec2', nameFrFr: 'comp2Fr', nameEnUs: 'comp2En', index: '2.1', areaId: 'recArea2', color: 'rec2Color', skillIds: ['skill3', 'skill4', 'skill5'] },
        ],
        tubes: [
          { id: 'recTube1', competenceId: 'rec1' },
          { id: 'recTube2', competenceId: 'rec2' },
        ],
        skills: [
          { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1' },
          { id: 'skill2', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1' },
          { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' },
          { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' },
          { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' },
        ],
      };

      mockLearningContent(learningContent);
      return databaseBuilder.commit();
    });

    it('use the most recent assessment to define if the participation is completed', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'started', createdAt: new Date('2021-01-01') });
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed', createdAt: new Date('2021-01-02') });
      await databaseBuilder.commit();

      const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

      expect(campaignAssessmentParticipationResult).to.deep.include({
        isCompleted: true,
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });
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
      databaseBuilder
        .factory
        .knowledgeElementSnapshotFactory
        .buildSnapshot({
          userId,
          snappedAt: new Date('2020-01-02'),
          knowledgeElementsAttributes,
        });
      await databaseBuilder.commit();
      const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

      expect(campaignAssessmentParticipationResult).to.deep.include({
        id: campaignParticipationId,
        knowledgeElementsCount: 2,
        testedSkillsCount: 2,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    it('computes the results for each competence assessed', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

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
          skillId: 'skill2',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
        {
          userId,
          skillId: 'skill3',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        },
        {
          userId,
          skillId: 'skill4',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
      ];

      databaseBuilder
        .factory
        .knowledgeElementSnapshotFactory
        .buildSnapshot({
          userId,
          snappedAt: new Date('2020-01-02'),
          knowledgeElementsAttributes,
        });
      await databaseBuilder.commit();
      const campaignAssessmentParticipationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');
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
          testedSkillsCount: 2,
          totalSkillsCount: 2,
          validatedSkillsCount: 1,
        },
      ]);
    });

  });
});
