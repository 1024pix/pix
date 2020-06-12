const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-profile-serializer');

describe('Unit | Serializer | JSONAPI | campaign-profile-serializer', function() {

  describe('#serialize', function() {

    const campaignProfile = {
      campaignParticipationId: 9,
      campaignId: 8,
      firstName: 'someFirstName',
      lastName: 'someLastName',
      isShared: true,
      externalId: 'anExternalId',
      createdAt: '2020-01-01',
      sharedAt: '2020-01-02',
      pixScore: 'someParticipantExternalId',
      competencesCount: '10',
      certifiableCompetencesCount: '2',
      isCertifiable: 'true',
    };

    const expectedJsonApi = {
      data: {
        type: 'campaign-profiles',
        id: '9',
        attributes: {
          'first-name': 'someFirstName',
          'last-name': 'someLastName',
          'campaign-id': 8,
          'external-id': 'anExternalId',
          'pix-score': 'someParticipantExternalId',
          'created-at': '2020-01-01',
          'shared-at': '2020-01-02',
          'is-shared': true,
          'competences-count': '10',
          'certifiable-competences-count': '2',
          'is-certifiable': 'true',
        },
      }
    };

    it('should convert a campaignProfile model object into JSON API data', function() {
      const json = serializer.serialize(campaignProfile);

      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
