const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-profile-serializer');
const CampaignProfile = require('../../../../../lib/domain/read-models/CampaignProfile');
const CertificationProfile = require('../../../../../lib/domain/models/CertificationProfile');
const UserCompetence = require('../../../../../lib/domain/models/UserCompetence');
const Area = require('../../../../../lib/domain/models/Area');

describe('Unit | Serializer | JSONAPI | campaign-profile-serializer', function() {

  describe('#serialize', function() {

    const campaignProfile = new CampaignProfile({
      campaignParticipationId: 9,
      campaignId: 8,
      firstName: 'someFirstName',
      lastName: 'someLastName',
      isShared: true,
      participantExternalId: 'anExternalId',
      createdAt: '2020-01-01',
      sharedAt: '2020-01-02',
      certificationProfile: new CertificationProfile({
        userCompetences: [
          new UserCompetence({
            id: 1,
            name: 'competence1',
            index: '1.1.1',
            pixScore: 12,
            estimatedLevel: 1,
            area: new Area({
              id: 1,
              title: 'area1',
              color: 'blue',
            }),
          }),
        ],
      }),
    });

    const expectedJsonApi = {
      data: {
        type: 'campaign-profiles',
        id: '9',
        attributes: {
          'first-name': 'someFirstName',
          'last-name': 'someLastName',
          'campaign-id': 8,
          'external-id': 'anExternalId',
          'pix-score': 12,
          'created-at': '2020-01-01',
          'shared-at': '2020-01-02',
          'is-shared': true,
          'competences-count': 1,
          'certifiable-competences-count': 1,
          'is-certifiable': false,
        },
        relationships: {
          competences: {
            data: [{
              id: '1',
              type: 'campaign-profile-competences',
            }]
          },
        },
      },
      included: [{
        type: 'campaign-profile-competences',
        id: '1',
        attributes: {
          name: 'competence1',
          'index': '1.1.1',
          'pix-score': 12,
          'estimated-level': 1,
          'area-color': 'blue',
        },
      }],
    };

    it('should convert a campaignProfile model object into JSON API data', function() {
      const json = serializer.serialize(campaignProfile);

      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
