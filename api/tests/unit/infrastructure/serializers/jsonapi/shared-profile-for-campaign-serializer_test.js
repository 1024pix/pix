const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const SharedProfileForCampaign = require('../../../../../lib/domain/models/SharedProfileForCampaign');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer');
const constants = require('../../../../../lib/domain/constants');

describe('Unit | Serializer | JSONAPI | shared-profile-for-campaign-serializer', () => {
  let clock;
  afterEach(() => {
    clock.restore();
  });

  beforeEach(() => {
    constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = 1;
    const now = new Date('2020-01-02');
    clock = sinon.useFakeTimers(now);
  });

  describe('#serialize()', () => {
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
      domainBuilder.buildUserScorecard({ id: 'rec1', area: area1 }),
      domainBuilder.buildUserScorecard({ id: 'rec2', area: area2 }),
    ];

    const profileSharedForCampaign = new SharedProfileForCampaign({
      id: '1',
      sharedAt: new Date('2020-01-01'),
      campaignAllowsRetry: true,
      scorecards: expectedScorecards,
    });

    const expectedSerializedScorecard = {
      data: {
        type: 'SharedProfileForCampaigns',
        id: profileSharedForCampaign.id,
        attributes: {
          'pix-score': profileSharedForCampaign.pixScore,
          'shared-at': profileSharedForCampaign.sharedAt,
          'can-retry': true,
        },
        relationships: {
          scorecards: {
            data: [
              {
                id: expectedScorecards[0].id,
                type: 'scorecards',
              },
              {
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
            code: expectedScorecards[0].area.code,
            title: expectedScorecards[0].area.title,
            color: expectedScorecards[0].area.color,
          },
          id: expectedScorecards[0].area.id,
          type: 'areas',
        },
        {
          attributes: {
            'name': expectedScorecards[0].name,
            'description': expectedScorecards[0].description,
            'index': expectedScorecards[0].index,
            'competence-id': expectedScorecards[0].competenceId,
            'earned-pix': expectedScorecards[0].earnedPix,
            'level': expectedScorecards[0].level,
            'pix-score-ahead-of-next-level': expectedScorecards[0].pixScoreAheadOfNextLevel,
            'status': expectedScorecards[0].status,
          },
          id: expectedScorecards[0].id,
          type: 'scorecards',
          relationships: {
            area: {
              data: {
                id: expectedScorecards[0].area.id,
                type: 'areas',
              },
            },
          },
        },
        {
          attributes: {
            code: expectedScorecards[1].area.code,
            title: expectedScorecards[1].area.title,
            color: expectedScorecards[1].area.color,
          },
          id: expectedScorecards[1].area.id,
          type: 'areas',
        },
        {
          attributes: {
            'name': expectedScorecards[1].name,
            'description': expectedScorecards[1].description,
            'index': expectedScorecards[1].index,
            'competence-id': expectedScorecards[1].competenceId,
            'earned-pix': expectedScorecards[1].earnedPix,
            'level': expectedScorecards[1].level,
            'pix-score-ahead-of-next-level': expectedScorecards[1].pixScoreAheadOfNextLevel,
            'status': expectedScorecards[1].status,
          },
          id: expectedScorecards[1].id,
          type: 'scorecards',
          relationships: {
            area: {
              data: {
                id: expectedScorecards[1].area.id,
                type: 'areas',
              },
            },
          },
        },
      ],
    };

    it('should convert a scorecard object into JSON API data', () => {
      // when
      const json = serializer.serialize(profileSharedForCampaign);

      // then
      expect(json).to.deep.equal(expectedSerializedScorecard);
    });

  });
});
