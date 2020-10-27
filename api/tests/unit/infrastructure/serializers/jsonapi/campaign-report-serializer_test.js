const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer');

describe('Unit | Serializer | JSONAPI | campaign-report-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Campaign-Report model object into JSON API data', function() {
      // given
      const report = domainBuilder.buildCampaignReport({
        id: 'campaign_report_id',
        participationsCount: 4,
        sharedParticipationsCount: 2,
        stages: [{
          id: 1,
          title: 'stage1',
          message: 'stageMessage',
          threshold: 30,
        }],
      });

      // when
      const json = serializer.serialize(report);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'campaign-reports',
          id: report.id,
          relationships: {
            stages: {
              data: [
                {
                  id: '1',
                  type: 'stages',
                },
              ],
            },
          },
          attributes: {
            'participations-count': 4,
            'shared-participations-count': 2,
          },
        },
        included: [
          {
            attributes: {
              message: 'stageMessage',
              threshold: 30,
              title: 'stage1',
            },
            id: '1',
            type: 'stages',
          },
        ],
      });
    });
  });
});
