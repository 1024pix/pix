const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-profile-serializer');
const CampaignProfile = require('../../../../../lib/domain/read-models/CampaignProfile');
const PlacementProfile = require('../../../../../lib/domain/models/PlacementProfile');
const UserCompetence = require('../../../../../lib/domain/models/UserCompetence');
const CampaignParticipationStatuses = require('../../../../../lib/domain/models/CampaignParticipationStatuses');

const { SHARED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-profile-serializer', function () {
  describe('#serialize', function () {
    it('should convert a campaignProfile model object into JSON API data', function () {
      // given
      const campaignProfile = new CampaignProfile({
        campaignParticipationId: 9,
        campaignId: 8,
        firstName: 'someFirstName',
        lastName: 'someLastName',
        status: SHARED,
        participantExternalId: 'anExternalId',
        createdAt: '2020-01-01',
        sharedAt: '2020-01-02',
        pixScore: 12,
        placementProfile: new PlacementProfile({
          userCompetences: [
            new UserCompetence({
              id: 1,
              name: 'competence1',
              index: '1.1.1',
              pixScore: 12,
              estimatedLevel: 1,
              areaId: 'recArea',
            }),
          ],
        }),
        allAreas: [domainBuilder.buildArea({ id: 'recArea', color: 'blue' })],
      });

      // when
      const json = serializer.serialize(campaignProfile);

      // then
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
              data: [
                {
                  id: '1',
                  type: 'campaign-profile-competences',
                },
              ],
            },
          },
        },
        included: [
          {
            type: 'campaign-profile-competences',
            id: '1',
            attributes: {
              name: 'competence1',
              index: '1.1.1',
              'pix-score': 12,
              'estimated-level': 1,
              'area-color': 'blue',
            },
          },
        ],
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
