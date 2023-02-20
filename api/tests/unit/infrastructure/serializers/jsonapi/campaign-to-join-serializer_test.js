import { expect, domainBuilder } from '../../../../test-helper';
import campaignToJoinSerializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-to-join-serializer';

describe('Unit | Serializer | JSONAPI | campaign-to-join-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a CampaignToJoin model object into JSON API data', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ identityProvider: 'SUPER_IDP' });

      // when
      const jsonApi = campaignToJoinSerializer.serialize(campaignToJoin);

      // then
      expect(jsonApi).to.deep.equal({
        data: {
          type: 'campaigns',
          id: campaignToJoin.id.toString(),
          attributes: {
            code: campaignToJoin.code,
            title: campaignToJoin.title,
            type: campaignToJoin.type,
            'id-pix-label': campaignToJoin.idPixLabel,
            'custom-landing-page-text': campaignToJoin.customLandingPageText,
            'external-id-help-image-url': campaignToJoin.externalIdHelpImageUrl,
            'alternative-text-to-external-id-help-image': campaignToJoin.alternativeTextToExternalIdHelpImage,
            'is-archived': campaignToJoin.isArchived,
            'is-restricted': campaignToJoin.isRestricted,
            'is-simplified-access': campaignToJoin.isSimplifiedAccess,
            'is-for-absolute-novice': campaignToJoin.isForAbsoluteNovice,
            'identity-provider': campaignToJoin.identityProvider,
            'organization-name': campaignToJoin.organizationName,
            'organization-type': campaignToJoin.organizationType,
            'organization-logo-url': campaignToJoin.organizationLogoUrl,
            'organization-show-nps': campaignToJoin.organizationShowNPS,
            'organization-form-nps-url': campaignToJoin.organizationFormNPSUrl,
            'target-profile-name': campaignToJoin.targetProfileName,
            'target-profile-image-url': campaignToJoin.targetProfileImageUrl,
            'custom-result-page-text': campaignToJoin.customResultPageText,
            'custom-result-page-button-text': campaignToJoin.customResultPageButtonText,
            'custom-result-page-button-url': campaignToJoin.customResultPageButtonUrl,
            'multiple-sendings': campaignToJoin.multipleSendings,
            'is-flash': campaignToJoin.isFlash,
          },
        },
      });
    });
  });
});
