const { expect, domainBuilder } = require('../../../../test-helper');
const campaignToJoinSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-to-join-serializer');

describe('Unit | Serializer | JSONAPI | campaign-to-join-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a CampaignToJoin model object into JSON API data', function() {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin();

      // when
      const jsonApi = campaignToJoinSerializer.serialize(campaignToJoin);

      // then
      expect(jsonApi).to.deep.equal({
        data: {
          type: 'campaigns',
          id: campaignToJoin.id.toString(),
          attributes: {
            'code': campaignToJoin.code,
            'title': campaignToJoin.title,
            'type': campaignToJoin.type,
            'id-pix-label': campaignToJoin.idPixLabel,
            'custom-landing-page-text': campaignToJoin.customLandingPageText,
            'external-id-help-image-url': campaignToJoin.externalIdHelpImageUrl,
            'alternative-text-to-external-id-help-image': campaignToJoin.alternativeTextToExternalIdHelpImage,
            'is-archived': campaignToJoin.isArchived,
            'is-restricted': campaignToJoin.isRestricted,
            'is-simplified-access': campaignToJoin.isSimplifiedAccess,
            'is-for-absolute-novice': campaignToJoin.isForAbsoluteNovice,
            'organization-is-pole-emploi': campaignToJoin.organizationIsPoleEmploi,
            'organization-name': campaignToJoin.organizationName,
            'organization-type': campaignToJoin.organizationType,
            'organization-logo-url': campaignToJoin.organizationLogoUrl,
            'target-profile-name': campaignToJoin.targetProfileName,
            'target-profile-image-url': campaignToJoin.targetProfileImageUrl,
          },
        },
      });
    });
  });
});
