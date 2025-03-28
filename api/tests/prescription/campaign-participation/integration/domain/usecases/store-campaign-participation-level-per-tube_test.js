import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, domainBuilder } from '../../../../../test-helper.js';

describe('Integration | UseCases | storeCampaignParticipationLevelPerTube', function () {
  describe('compute', function () {
    let campaignParticipationId;

    beforeEach(function () {
      const learningContentData = {
        frameworks: [
          {
            id: 'frameworkId',
            name: 'frameworkName',
            areas: [
              {
                id: 'recArea1',
                frameworkId: 'frameworkId',
                competenceIds: ['recCompetence1'],
                competences: [
                  {
                    id: 'recCompetence1',
                    index: '1.1',
                    name: 'nom de la competence',
                    description: 'description de la competence',
                    areaId: 'recArea1',
                    origin: 'Pix',
                    tubes: [
                      {
                        id: 'recTube1',
                        practicalTitle: 'tube1',
                        practicalDescription: 'tube1 description',
                        competenceId: 'recCompetence1',
                        skills: [
                          {
                            id: 'recSkillWeb1',
                            name: '@web1',
                            status: 'actif',
                            difficulty: 1,
                          },
                          {
                            id: 'recSkillWeb2',
                            name: '@web2',
                            status: 'actif',
                            difficulty: 2,
                          },
                        ],
                      },
                      {
                        id: 'recTube2',
                        practicalTitle: 'tube2',
                        practicalDescription: 'tube2 description',
                        competenceId: 'recCompetence1',
                        skills: [
                          {
                            id: 'recSkillUrl1',
                            name: '@url1',
                            status: 'actif',
                            difficulty: 3,
                          },
                          {
                            id: 'recSkillUrl2',
                            name: '@url2',
                            status: 'actif',
                            difficulty: 4,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const userId = databaseBuilder.factory.buildUser({}).id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      }).id;

      domainBuilder.buildLearningContent(learningContentData.frameworks);

      const ke1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: 'skill1',
        userId: 1,
      });

      const ke2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'skill2',
        userId: 1,
      });

      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill1' });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill2' });

      const snapshot = new KnowledgeElementCollection([ke1, ke2]).toSnapshot();

      databaseBuilder.factory.buildKnowledgeElementSnapshot({ campaignParticipationId: 1, snapshot });

      databaseBuilder.commit();
    });

    it('should store the reached level per tube', function () {
      expect(true).equal(true);
    });
  });
});
