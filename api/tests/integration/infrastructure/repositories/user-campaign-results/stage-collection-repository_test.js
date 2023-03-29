const { expect, databaseBuilder, learningContentBuilder, mockLearningContent } = require('../../../../test-helper');
const stageCollectionRepository = require('../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js');

const competenceId = 'recCompetence';
const learningContent = [
  {
    id: 'recArea0',
    competences: [
      {
        id: competenceId,
        titreFrFr: 'Mener une recherche et une veille d’information',
        index: '1.1',
        tubes: [
          {
            id: 'recTube0_0',
            skills: [
              {
                id: 'skillWeb1',
                nom: '@skillWeb1',
                status: 'actif',
                challenges: [],
                level: 1,
              },
              {
                id: 'skillWeb2',
                nom: '@skillWeb2',
                status: 'actif',
                challenges: [],
                level: 2,
              },
              {
                id: 'skillWeb3',
                nom: '@skillWeb3',
                status: 'actif',
                challenges: [],
                level: 3,
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Integration | Infrastructure | Repository | stage-collection-repository', function () {
  describe('#findStageCollection', function () {
    let targetProfileId;
    let campaignId;

    beforeEach(async function () {
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT', targetProfileId }).id;
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillWeb1', campaignId });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillWeb2', campaignId });
      databaseBuilder.factory.buildCampaignSkill({ skillId: 'skillWeb3', campaignId });

      await databaseBuilder.commit();
    });

    it('returns ordered stage by threshold', async function () {
      databaseBuilder.factory.buildStage({ level: null, threshold: 0, targetProfileId });
      databaseBuilder.factory.buildStage({ level: null, threshold: 50, targetProfileId });
      databaseBuilder.factory.buildStage({ level: null, threshold: null, isFirstSkill: true, targetProfileId });
      databaseBuilder.factory.buildStage({ level: null, threshold: 100, targetProfileId });

      await databaseBuilder.commit();

      const result = await stageCollectionRepository.findStageCollection({ campaignId });

      const stages = result.stages;

      expect(stages).to.have.length(4);
      expect(stages[0].threshold).to.equal(0);
      expect(stages[1].isFirstSkill).to.be.true;
      expect(stages[2].threshold).to.equal(50);
      expect(stages[3].threshold).to.equal(100);
    });

    it('returns ordered stage by level transform into threshold', async function () {
      databaseBuilder.factory.buildStage({ level: 3, threshold: null, targetProfileId });
      databaseBuilder.factory.buildStage({ level: 0, threshold: null, targetProfileId });
      databaseBuilder.factory.buildStage({ level: null, threshold: null, isFirstSkill: true, targetProfileId });
      databaseBuilder.factory.buildStage({ level: 2, threshold: null, targetProfileId });

      await databaseBuilder.commit();

      const result = await stageCollectionRepository.findStageCollection({ campaignId });

      const stages = result.stages;

      expect(stages).to.have.length(4);
      expect(stages[0].threshold).to.equal(0);
      expect(stages[1].isFirstSkill).to.be.true;
      expect(stages[2].threshold).to.equal(67);
      expect(stages[3].threshold).to.equal(100);
    });
  });
});
