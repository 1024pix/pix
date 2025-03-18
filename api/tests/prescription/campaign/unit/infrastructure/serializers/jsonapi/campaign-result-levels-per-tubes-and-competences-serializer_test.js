import { expect } from 'chai';

import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import * as serializer from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/campaign-result-levels-per-tubes-and-competences-serializer.js';
import { KnowledgeElementCollection } from '../../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { domainBuilder } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | campaign-result-levels-per-tubes-and-competences-serializer', function () {
  describe('#serialize', function () {
    let learningContent, keData;

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
      learningContent = domainBuilder.buildLearningContent(learningContentData.frameworks);

      const user1ke1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillWeb1',
        userId: 1,
      });
      const user1ke2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: 'recSkillWeb2',
        userId: 1,
      });

      const user2ke1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillUrl1',
        userId: 2,
      });

      const user2ke2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recSkillUrl2',
        userId: 2,
      });

      keData = {
        participationId1: new KnowledgeElementCollection([user1ke1, user1ke2]).latestUniqNonResetKnowledgeElements,
        participationId2: new KnowledgeElementCollection([user2ke1, user2ke2]).latestUniqNonResetKnowledgeElements,
      };
    });

    it('should convert CampaignResultLevelPerTubesAndCompentences acquisitions statistics into JSON API data', function () {
      const campaignId = 1;
      const model = new CampaignResultLevelsPerTubesAndCompetences({
        campaignId: 1,
        learningContent,
        knowledgeElementsByParticipation: keData,
      });
      const json = serializer.serialize(model);

      expect(json).to.deep.equal({
        data: {
          type: 'campaign-result-levels-per-tubes-and-competences',
          id: `${campaignId}`,
          attributes: {
            'campaign-max-reachable-level': 3,
            'campaign-mean-reached-level': 1.25,
          },
          relationships: {
            'campaign-levels-per-competence': {
              data: [
                {
                  id: 'recCompetence1',
                  type: 'campaignLevelsPerCompetences',
                },
              ],
            },
            'campaign-levels-per-tube': {
              data: [
                {
                  id: 'recTube1',
                  type: 'campaignLevelsPerTubes',
                },
                {
                  id: 'recTube2',
                  type: 'campaignLevelsPerTubes',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              'competence-id': 'recCompetence1',
              'max-level': 2,
              'mean-level': 0.5,
              'practical-description': 'tube1 description',
              'practical-title': 'tube1',
            },
            id: 'recTube1',
            type: 'campaignLevelsPerTubes',
          },
          {
            attributes: {
              'competence-id': 'recCompetence1',
              'max-level': 4,
              'mean-level': 2,
              'practical-description': 'tube2 description',
              'practical-title': 'tube2',
            },
            id: 'recTube2',
            type: 'campaignLevelsPerTubes',
          },
          {
            attributes: {
              description: 'description de la competence',
              index: '1.1',
              'max-level': 3,
              'mean-level': 1.25,
              name: 'nom de la competence',
            },
            id: 'recCompetence1',
            type: 'campaignLevelsPerCompetences',
          },
        ],
      });
    });
  });
});
