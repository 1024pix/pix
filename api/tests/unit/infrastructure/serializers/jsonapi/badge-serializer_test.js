const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/badge-serializer');

describe('Unit | Serializer | JSONAPI | badge-serializer', function() {

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
      });

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
                type: 'badge-criterion',
              }, {
                id: '2',
                type: 'badge-criterion',
              }],
            },
            'badge-partner-competences': {
              'data': [{
                id: '1',
                type: 'badge-partner-competence',
              }, {
                id: '2',
                type: 'badge-partner-competence',
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
            type: 'badge-criterion',
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
                  type: 'badge-partner-competence',
                }, {
                  id: '2',
                  type: 'badge-partner-competence',
                }],
              },
            },
            id: '2',
            type: 'badge-criterion',
          },
          {
            attributes: {
              name: 'name',
            },
            id: '1',
            type: 'badge-partner-competence',
          },
          {
            attributes: {
              name: 'name',
            },
            id: '2',
            type: 'badge-partner-competence',
          },
        ],
      };

      // when
      const json = serializer.serialize(badge);

      // then
      expect(json).to.deep.equal(expectedSerializedBadge);
    });
  });

});
