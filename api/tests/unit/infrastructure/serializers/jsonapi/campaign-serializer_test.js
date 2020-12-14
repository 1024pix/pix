const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const Campaign = require('../../../../../lib/domain/models/Campaign');

describe('Unit | Serializer | JSONAPI | campaign-serializer', function() {

  describe('#serialize', function() {

    const tokenToAccessToCampaign = 'token';
    const meta = { some: 'meta' };

    context('when the campaign does not have a campaignReport', function() {

      it('should convert a Campaign model object into JSON API data', function() {
        // given
        const targetProfile = domainBuilder.buildTargetProfile({
          id: '123',
          name: 'TargetProfile1',
          imageUrl: 'http://url.fr',
          badges: [domainBuilder.buildBadge({ id: 456, title: 'badge1', imageUrl: 'http://url.fr' })],
        });

        const campaign = new Campaign({
          id: 5,
          name: 'My zuper campaign',
          code: 'ATDGER342',
          title: 'Parcours recherche internet',
          customLandingPageText: 'Parcours concernant la recherche internet',
          archivedAt: new Date('2019-03-01T23:04:05Z'),
          createdAt: new Date('2018-02-06T14:12:44Z'),
          creator: { id: 3453, firstName: 'Daenerys', lastName: 'Targaryen' },
          organizationId: 10293,
          organizationLogoUrl: 'some logo',
          organizationName: 'College Victor Hugo',
          organizationType: 'SCO',
          idPixLabel: 'company id',
          externalIdHelpImageUrl: 'some url',
          alternativeTextToExternalIdHelpImage: 'alternative text',
          targetProfile,
          type: 'ASSESSMENT',
        });

        const expectedSerializedCampaign = {
          data: {
            type: 'campaigns',
            id: '5',
            attributes: {
              name: 'My zuper campaign',
              code: 'ATDGER342',
              title: 'Parcours recherche internet',
              'archived-at': new Date('2019-03-01T23:04:05Z'),
              'custom-landing-page-text': 'Parcours concernant la recherche internet',
              'created-at': new Date('2018-02-06T14:12:44Z'),
              'id-pix-label': 'company id',
              'external-id-help-image-url': 'some url',
              'alternative-text-to-external-id-help-image': 'alternative text',
              'token-for-campaign-results': tokenToAccessToCampaign,
              'organization-logo-url': 'some logo',
              'organization-name': 'College Victor Hugo',
              'organization-type': 'SCO',
              'is-restricted': false,
              type: 'ASSESSMENT',
            },
            relationships: {
              'target-profile': {
                data: {
                  id: '123',
                  type: 'targetProfiles',
                },
              },
              'creator': {
                data: {
                  id: '3453',
                  type: 'users',
                },
              },
              'campaign-report': {
                'links': {
                  'related': '/api/campaigns/5/campaign-report',
                },
              },
              'campaign-collective-result': {
                'links': {
                  'related': '/api/campaigns/5/collective-results',
                },
              },
              'campaign-analysis': {
                'links': {
                  'related': '/api/campaigns/5/analyses',
                },
              },
            },
          },
          included: [
            {
              attributes: {
                name: 'TargetProfile1',
                'image-url': 'http://url.fr',
                'has-badges': true,
              },
              id: '123',
              type: 'targetProfiles',
            },
            {
              id: '3453',
              type: 'users',
              attributes: {
                'first-name': 'Daenerys',
                'last-name': 'Targaryen',
              },
            },
          ],
          meta,
        };

        // when
        const json = serializer.serialize(campaign, meta, { tokenForCampaignResults: tokenToAccessToCampaign });

        // then
        expect(json).to.deep.equal(expectedSerializedCampaign);
      });
    });

    context('when the campaign has already a campaignReport', function() {

      it('should convert a Campaign model object into JSON API data and include campaignReport', function() {
        // given
        const campaignReport = domainBuilder.buildCampaignReport({ id: '5', participationsCount: '5', sharedParticipationsCount: '3' });

        const campaign = new Campaign({
          id: 5,
          name: 'My zuper campaign',
          code: 'ATDGER342',
          title: 'Parcours recherche internet',
          customLandingPageText: 'Parcours concernant la recherche internet',
          archivedAt: new Date('2019-03-01T23:04:05Z'),
          createdAt: new Date('2018-02-06T14:12:44Z'),
          creator: { id: 3453, firstName: 'Daenerys', lastName: 'Targaryen' },
          organizationId: 10293,
          organizationLogoUrl: 'some logo',
          organizationName: 'College Victor Hugo',
          organizationType: 'SCO',
          idPixLabel: 'company id',
          externalIdHelpImageUrl: 'some url',
          alternativeTextToExternalIdHelpImage: 'alternative text',
          targetProfile: domainBuilder.buildTargetProfile({ id: '123', name: 'TargetProfile1', imageUrl: 'http://url.fr' }),
          campaignReport,
          type: 'ASSESSMENT',
        });

        const expectedSerializedCampaign = {
          data: {
            type: 'campaigns',
            id: '5',
            attributes: {
              name: 'My zuper campaign',
              code: 'ATDGER342',
              title: 'Parcours recherche internet',
              'archived-at': new Date('2019-03-01T23:04:05Z'),
              'custom-landing-page-text': 'Parcours concernant la recherche internet',
              'created-at': new Date('2018-02-06T14:12:44Z'),
              'id-pix-label': 'company id',
              'external-id-help-image-url': 'some url',
              'alternative-text-to-external-id-help-image': 'alternative text',
              'token-for-campaign-results': tokenToAccessToCampaign,
              'organization-logo-url': 'some logo',
              'organization-type': 'SCO',
              'organization-name': 'College Victor Hugo',
              'is-restricted': false,
              type: 'ASSESSMENT',
            },
            relationships: {
              'target-profile': {
                data: {
                  id: '123',
                  type: 'targetProfiles',
                },
              },
              'creator': {
                data: {
                  id: '3453',
                  type: 'users',
                },
              },
              'campaign-report': {
                data: {
                  id: '5',
                  type: 'campaignReports',
                },
                'links': {
                  'related': '/api/campaigns/5/campaign-report',
                },
              },
              'campaign-collective-result': {
                'links': {
                  'related': '/api/campaigns/5/collective-results',
                },
              },
              'campaign-analysis': {
                'links': {
                  'related': '/api/campaigns/5/analyses',
                },
              },
            },
          },
          included: [
            {
              attributes: {
                name: 'TargetProfile1',
                'image-url': 'http://url.fr',
                'has-badges': false,
              },
              id: '123',
              type: 'targetProfiles',
            },
            {
              attributes: {
                'participations-count': '5',
                'shared-participations-count': '3',
              },
              id: '5',
              type: 'campaignReports',
            },
            {
              id: '3453',
              type: 'users',
              attributes: {
                'first-name': 'Daenerys',
                'last-name': 'Targaryen',
              },
            },
          ],
          meta,
        };

        // when
        const json = serializer.serialize(campaign, meta, { tokenForCampaignResults: tokenToAccessToCampaign, ignoreCampaignReportRelationshipData: false });

        // then
        expect(json).to.deep.equal(expectedSerializedCampaign);
      });
    });

    context('When there is no campaign', function() {

      it('should return an empty JSON API data', function() {
        // given
        const tokenToAccessToCampaign = 'token';

        const campaigns = [];

        const expectedSerializedCampaigns = {
          data: [],
          meta,
        };

        // when
        const json = serializer.serialize(campaigns, meta, { tokenForCampaignResults: tokenToAccessToCampaign });

        // then
        expect(json).to.deep.equal(expectedSerializedCampaigns);
      });
    });

  });

  describe('#deserialize', function() {

    it('should convert JSON API campaign data into a Campaign model object', async function() {
      // given
      const organizationId = 10293;
      const targetProfileId = '23';
      const jsonAnswer = {
        data: {
          type: 'campaign',
          attributes: {
            name: 'My super campaign',
            'organization-id': organizationId,
          },
          relationships: {
            'target-profile': {
              data: {
                id: targetProfileId,
              },
            },
          },
        },
      };

      // when
      const campaign = await serializer.deserialize(jsonAnswer);

      // then
      expect(campaign).to.be.instanceOf(Campaign);
      expect(campaign.name).to.equal(jsonAnswer.data.attributes.name);
      expect(campaign.organizationId).to.equal(organizationId);
      expect(campaign.targetProfileId).to.equal(23);
    });

    context('when no targetProfileId', () => {
      it('should convert JSON API campaign data into a Campaign model object', async function() {
        // given
        const organizationId = 10293;
        const jsonAnswer = {
          data: {
            type: 'campaign',
            attributes: {
              name: 'My super campaign',
              'organization-id': organizationId,
            },
            relationships: {
              'target-profile': {
                data: {
                  id: undefined,
                },
              },
            },
          },
        };

        // when
        const campaign = await serializer.deserialize(jsonAnswer);

        // then
        expect(campaign).to.be.instanceOf(Campaign);
        expect(campaign.name).to.equal(jsonAnswer.data.attributes.name);
        expect(campaign.organizationId).to.equal(organizationId);
        expect(campaign.targetProfileId).to.equal(undefined);
      });
    });

  });

});
