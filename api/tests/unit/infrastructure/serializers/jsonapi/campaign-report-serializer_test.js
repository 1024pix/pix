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
          prescriberTitle: 'stage1',
          prescriberDescription: 'description',
          threshold: 30,
        }],
        badges: [{
          id: 123,
          title: 'badge123',
        }],
      });

      // when
      const json = serializer.serialize(report);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'campaigns',
          id: report.id.toString(),
          relationships: {
            stages: {
              data: [
                {
                  id: report.stages[0].id.toString(),
                  type: 'stages',
                },
              ],
            },
            badges: {
              data: [
                {
                  id: report.badges[0].id.toString(),
                  type: 'badges',
                },
              ],
            },
            'campaign-analysis': {
              links: {
                related: '/api/campaigns/campaign_report_id/analyses',
              },
            },
            'campaign-collective-result': {
              links: {
                related: '/api/campaigns/campaign_report_id/collective-results',
              },
            },
            divisions: {
              links: {
                related: '/api/campaigns/campaign_report_id/divisions',
              },
            },
          },
          attributes: {
            code: report.code,
            name: report.name,
            type: report.type,
            title: report.title,
            'created-at': report.createdAt,
            'creator-id': report.creatorId,
            'creator-first-name': report.creatorFirstName,
            'creator-last-name': report.creatorLastName,
            'custom-landing-page-text': report.customLandingPageText,
            'id-pix-label': report.idPixLabel,
            'is-archived': report.isArchived,
            'target-profile-id': report.targetProfileId,
            'target-profile-name': report.targetProfileName,
            'target-profile-image-url': report.targetProfileImageUrl,
            'token-for-campaign-results': report.tokenForCampaignResults,
            'participations-count': report.participationsCount,
            'shared-participations-count': report.sharedParticipationsCount,
          },
        },
        included: [
          {
            attributes: {
              'prescriber-description': report.stages[0].prescriberDescription,
              threshold: report.stages[0].threshold,
              'prescriber-title': report.stages[0].prescriberTitle,
            },
            id: report.stages[0].id.toString(),
            type: 'stages',
          },
          {
            attributes: {
              title: report.badges[0].title,
            },
            id: report.badges[0].id.toString(),
            type: 'badges',
          },
        ],
      });
    });
  });
});
