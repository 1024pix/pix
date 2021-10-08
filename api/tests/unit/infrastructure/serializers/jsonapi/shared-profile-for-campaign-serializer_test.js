const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const SharedProfileForCampaign = require('../../../../../lib/domain/models/SharedProfileForCampaign');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer');

describe('Unit | Serializer | JSONAPI | shared-profile-for-campaign-serializer', function () {
  let clock;
  afterEach(function () {
    clock.restore();
  });

  beforeEach(function () {
    const now = new Date('2020-01-02');
    clock = sinon.useFakeTimers(now);
  });

  describe('#serialize()', function () {
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
    const expectedScorecards = [
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildUserScorecard({ id: 'rec1', area: area1 }),
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      domainBuilder.buildUserScorecard({ id: 'rec2', area: area2 }),
    ];

    const profileSharedForCampaign = new SharedProfileForCampaign({
      id: '1',
      sharedAt: new Date('2020-01-01'),
      campaignAllowsRetry: true,
      isRegistrationActive: true,
      scorecards: expectedScorecards,
    });

    const expectedSerializedScorecard = {
      data: {
        type: 'SharedProfileForCampaigns',
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        id: profileSharedForCampaign.id,
        attributes: {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          'pix-score': profileSharedForCampaign.pixScore,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          'shared-at': profileSharedForCampaign.sharedAt,
          'can-retry': true,
        },
        relationships: {
          scorecards: {
            data: [
              {
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line mocha/no-setup-in-describe
                id: expectedScorecards[0].id,
                type: 'scorecards',
              },
              {
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line mocha/no-setup-in-describe
                id: expectedScorecards[1].id,
                type: 'scorecards',
              },
            ],
          },
        },
      },
      included: [
        {
          attributes: {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            code: expectedScorecards[0].area.code,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            title: expectedScorecards[0].area.title,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            color: expectedScorecards[0].area.color,
          },
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          id: expectedScorecards[0].area.id,
          type: 'areas',
        },
        {
          attributes: {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            name: expectedScorecards[0].name,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            description: expectedScorecards[0].description,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            index: expectedScorecards[0].index,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            'competence-id': expectedScorecards[0].competenceId,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            'earned-pix': expectedScorecards[0].earnedPix,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            level: expectedScorecards[0].level,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            'pix-score-ahead-of-next-level': expectedScorecards[0].pixScoreAheadOfNextLevel,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            status: expectedScorecards[0].status,
          },
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          id: expectedScorecards[0].id,
          type: 'scorecards',
          relationships: {
            area: {
              data: {
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line mocha/no-setup-in-describe
                id: expectedScorecards[0].area.id,
                type: 'areas',
              },
            },
          },
        },
        {
          attributes: {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            code: expectedScorecards[1].area.code,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            title: expectedScorecards[1].area.title,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            color: expectedScorecards[1].area.color,
          },
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          id: expectedScorecards[1].area.id,
          type: 'areas',
        },
        {
          attributes: {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            name: expectedScorecards[1].name,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            description: expectedScorecards[1].description,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            index: expectedScorecards[1].index,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            'competence-id': expectedScorecards[1].competenceId,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            'earned-pix': expectedScorecards[1].earnedPix,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            level: expectedScorecards[1].level,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            'pix-score-ahead-of-next-level': expectedScorecards[1].pixScoreAheadOfNextLevel,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            status: expectedScorecards[1].status,
          },
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          id: expectedScorecards[1].id,
          type: 'scorecards',
          relationships: {
            area: {
              data: {
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line mocha/no-setup-in-describe
                id: expectedScorecards[1].area.id,
                type: 'areas',
              },
            },
          },
        },
      ],
    };

    it('should convert a scorecard object into JSON API data', function () {
      // when
      const json = serializer.serialize(profileSharedForCampaign);

      // then
      expect(json).to.deep.equal(expectedSerializedScorecard);
    });
  });
});
