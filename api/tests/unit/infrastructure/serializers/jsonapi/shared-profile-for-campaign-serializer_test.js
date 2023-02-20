import { expect, domainBuilder, sinon } from '../../../../test-helper';
import SharedProfileForCampaign from '../../../../../lib/domain/read-models/SharedProfileForCampaign';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer';

describe('Unit | Serializer | JSONAPI | shared-profile-for-campaign-serializer', function () {
  let clock;
  afterEach(function () {
    clock.restore();
  });

  beforeEach(function () {
    const now = new Date('2020-01-02');
    clock = sinon.useFakeTimers(now);
  });

  let profileSharedForCampaign;
  describe('#serialize()', function () {
    beforeEach(function () {
      const area1 = {
        id: '1',
        code: '1',
        title: '1',
        color: '1',
      };
      const area2 = {
        id: '2',
        code: '2',
        title: '2',
        color: '2',
      };

      const competences = [
        domainBuilder.buildCompetence({ id: 'rec1', areaId: '1' }),
        domainBuilder.buildCompetence({ id: 'rec2', areaId: '2' }),
      ];
      const knowledgeElementsGroupedByCompetenceId = {
        rec1: [domainBuilder.buildKnowledgeElement()],
        rec2: [domainBuilder.buildKnowledgeElement()],
      };

      const campaignParticipation = domainBuilder.buildCampaignParticipation({
        id: '1',
        sharedAt: new Date('2020-01-01'),
      });

      profileSharedForCampaign = new SharedProfileForCampaign({
        campaignParticipation,
        campaignAllowsRetry: true,
        isOrganizationLearnerActive: true,
        competences,
        allAreas: [area1, area2],
        knowledgeElementsGroupedByCompetenceId,
        maxReachableLevel: 8,
        maxReachablePixScore: 768,
      });
    });

    it('should convert a scorecard object into JSON API data', function () {
      const expectedSharedProfileForCampaign = {
        data: {
          type: 'SharedProfileForCampaigns',
          id: profileSharedForCampaign.id,
          attributes: {
            'pix-score': profileSharedForCampaign.pixScore,
            'shared-at': profileSharedForCampaign.sharedAt,
            'can-retry': true,
            'max-reachable-level': 8,
            'max-reachable-pix-score': 768,
          },
          relationships: {
            scorecards: {
              data: [
                {
                  id: profileSharedForCampaign.scorecards[0].id,
                  type: 'scorecards',
                },
                {
                  id: profileSharedForCampaign.scorecards[1].id,
                  type: 'scorecards',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              code: profileSharedForCampaign.scorecards[0].area.code,
              title: profileSharedForCampaign.scorecards[0].area.title,
              color: profileSharedForCampaign.scorecards[0].area.color,
            },
            id: profileSharedForCampaign.scorecards[0].area.id,
            type: 'areas',
          },
          {
            attributes: {
              name: profileSharedForCampaign.scorecards[0].name,
              description: profileSharedForCampaign.scorecards[0].description,
              index: profileSharedForCampaign.scorecards[0].index,
              'competence-id': profileSharedForCampaign.scorecards[0].competenceId,
              'earned-pix': profileSharedForCampaign.scorecards[0].earnedPix,
              level: profileSharedForCampaign.scorecards[0].level,
              'pix-score-ahead-of-next-level': profileSharedForCampaign.scorecards[0].pixScoreAheadOfNextLevel,
              status: profileSharedForCampaign.scorecards[0].status,
            },
            id: profileSharedForCampaign.scorecards[0].id,
            type: 'scorecards',
            relationships: {
              area: {
                data: {
                  id: profileSharedForCampaign.scorecards[0].area.id,
                  type: 'areas',
                },
              },
            },
          },
          {
            attributes: {
              code: profileSharedForCampaign.scorecards[1].area.code,
              title: profileSharedForCampaign.scorecards[1].area.title,
              color: profileSharedForCampaign.scorecards[1].area.color,
            },
            id: profileSharedForCampaign.scorecards[1].area.id,
            type: 'areas',
          },
          {
            attributes: {
              name: profileSharedForCampaign.scorecards[1].name,
              description: profileSharedForCampaign.scorecards[1].description,
              index: profileSharedForCampaign.scorecards[1].index,
              'competence-id': profileSharedForCampaign.scorecards[1].competenceId,
              'earned-pix': profileSharedForCampaign.scorecards[1].earnedPix,
              level: profileSharedForCampaign.scorecards[1].level,
              'pix-score-ahead-of-next-level': profileSharedForCampaign.scorecards[1].pixScoreAheadOfNextLevel,
              status: profileSharedForCampaign.scorecards[1].status,
            },
            id: profileSharedForCampaign.scorecards[1].id,
            type: 'scorecards',
            relationships: {
              area: {
                data: {
                  id: profileSharedForCampaign.scorecards[1].area.id,
                  type: 'areas',
                },
              },
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(profileSharedForCampaign);

      // then
      expect(json).to.deep.equal(expectedSharedProfileForCampaign);
    });
  });
});
