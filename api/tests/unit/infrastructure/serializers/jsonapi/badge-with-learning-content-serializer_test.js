const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/badge-with-learning-content-serializer');

describe('Unit | Serializer | JSONAPI | badge-with-learning-content-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Badge model object into JSON API data', function() {
      // given
      const badge = domainBuilder.buildBadge({
        id: '1',
        altMessage: 'You won a banana badge',
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won a banana badge',
        key: 'BANANA',
        title: 'Banana',
        targetProfileId: '1',
        isCertifiable: false,
        badgeCriteria: [
          domainBuilder.buildBadgeCriterion({ partnerCompetenceIds: null }),
        ],
        badgePartnerCompetences: [],
      });
      const badgeWithLearningContent = domainBuilder.buildBadgeWithLearningContent({ badge });

      const expectedSerializedBadge = {
        data: {
          attributes: {
            'alt-message': 'You won a banana badge',
            'image-url': '/img/banana.svg',
            'is-certifiable': false,
            message: 'Congrats, you won a banana badge',
            title: 'Banana',
            key: 'BANANA',
          },
          id: '1',
          type: 'badges',
          relationships: {
            'badge-criteria': {
              'data': [{
                id: '1',
                type: 'badge-criteria',
              }],
            },
            'badge-partner-competences': {
              'data': [],
            },
          },
        },
        included: [
          {
            attributes: {
              scope: 'CampaignParticipation',
              threshold: 40,
            },
            id: '1',
            type: 'badge-criteria',
          },
        ],
      };

      // when
      const json = serializer.serialize(badgeWithLearningContent);

      // then
      expect(json).to.deep.equal(expectedSerializedBadge);
    });

    it('should convert a Badge model with badge partner competence object into JSON API data', function() {
      // given
      const badge = domainBuilder.buildBadge({
        id: '1',
        altMessage: 'You won a banana badge',
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won a banana badge',
        key: 'BANANA',
        title: 'Banana',
        targetProfileId: '1',
        isCertifiable: false,
      });

      const skills = [
        domainBuilder.buildSkill({ id: 'recABC', name: '@sau6', tubeId: 'recTUB123' }),
        domainBuilder.buildSkill({ id: 'recDEF', name: '@sau7', tubeId: 'recTUB123' }),
      ];

      const tubes = [
        domainBuilder.buildTube({ id: 'recTUB123', name: '@sau', skills }),
      ];

      const badgeWithLearningContent = domainBuilder.buildBadgeWithLearningContent({ badge, skills, tubes });

      const expectedSerializedBadge = {
        data: {
          attributes: {
            'alt-message': 'You won a banana badge',
            'image-url': '/img/banana.svg',
            'is-certifiable': false,
            message: 'Congrats, you won a banana badge',
            title: 'Banana',
            key: 'BANANA',
          },
          id: '1',
          type: 'badges',
          relationships: {
            'badge-criteria': {
              'data': [{
                id: '1',
                type: 'badge-criteria',
              }, {
                id: '2',
                type: 'badge-criteria',
              }],
            },
            'badge-partner-competences': {
              'data': [{
                id: '1',
                type: 'badge-partner-competences',
              }, {
                id: '2',
                type: 'badge-partner-competences',
              }],
            },
          },
        },
        included: [
          {
            attributes: {
              scope: 'CampaignParticipation',
              threshold: 40,
            },
            relationships: {
              'partner-competences': {
                data: [],
              },
            },
            id: '1',
            type: 'badge-criteria',
          },
          {
            attributes: {
              scope: 'CampaignParticipation',
              threshold: 40,
            },
            relationships: {
              'partner-competences': {
                data: [{
                  id: '1',
                  type: 'badge-partner-competences',
                }, {
                  id: '2',
                  type: 'badge-partner-competences',
                }],
              },
            },
            id: '2',
            type: 'badge-criteria',
          },
          {
            type: 'tubes',
            id: 'recTUB123',
            attributes: {
              'practical-title': 'titre pratique',
            },
            relationships: {},
          },
          {
            attributes: {
              name: '@sau6',
              difficulty: 6,
            },
            id: 'recABC',
            relationships: {
              tube: {
                data: {
                  id: 'recTUB123',
                  type: 'tubes',
                },
              },
            },
            type: 'skills',
          },
          {
            attributes: {
              name: '@sau7',
              difficulty: 7,
            },
            id: 'recDEF',
            relationships: {
              tube: {
                data: {
                  id: 'recTUB123',
                  type: 'tubes',
                },
              },
            },
            type: 'skills',
          },
          {
            attributes: {
              name: 'name',
            },
            id: '1',
            type: 'badge-partner-competences',
            relationships: {
              'skills': {
                data: [
                  {
                    id: 'recABC',
                    type: 'skills',
                  },
                  {
                    id: 'recDEF',
                    type: 'skills',
                  },
                ],
              },
            },
          },
          {
            attributes: {
              name: 'name',
            },
            id: '2',
            type: 'badge-partner-competences',
            relationships: {
              'skills': {
                data: [
                  {
                    id: 'recABC',
                    type: 'skills',
                  },
                  {
                    id: 'recDEF',
                    type: 'skills',
                  },
                ],
              },
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(badgeWithLearningContent);

      // then
      expect(json).to.deep.equal(expectedSerializedBadge);
    });
  });

});
