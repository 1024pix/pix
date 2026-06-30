import { campaignManagementSerializer } from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/campaign-management-serializer.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | campaign-management-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Campaign-Management model object into JSON API data', function () {
      // given
      const campaignManagement = domainBuilder.buildCampaignManagement();

      // when
      const json = campaignManagementSerializer.serialize(campaignManagement);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'campaigns',
          id: campaignManagement.id.toString(),
          attributes: {
            'archived-at': campaignManagement.archivedAt,
            'created-at': campaignManagement.createdAt,
            'creator-first-name': campaignManagement.creatorFirstName,
            'creator-id': campaignManagement.creatorId,
            'creator-last-name': campaignManagement.creatorLastName,
            'custom-landing-page-text': campaignManagement.customLandingPageText,
            'custom-result-page-button-text': campaignManagement.customResultPageButtonText,
            'custom-result-page-button-url': campaignManagement.customResultPageButtonUrl,
            'custom-result-page-text': campaignManagement.customResultPageText,
            'deleted-at': campaignManagement.deletedAt,
            'external-id-label': campaignManagement.externalIdLabel,
            'is-for-absolute-novice': campaignManagement.isForAbsoluteNovice,
            'is-profiles-collection': campaignManagement.isProfilesCollection,
            'is-type-assessment': campaignManagement.isTypeAssessment,
            'multiple-sendings': campaignManagement.multipleSendings,
            'organization-id': campaignManagement.organizationId,
            'organization-name': campaignManagement.organizationName,
            'owner-first-name': campaignManagement.ownerFirstName,
            'owner-id': campaignManagement.ownerId,
            'owner-last-name': campaignManagement.ownerLastName,
            'shared-participations-count': campaignManagement.sharedParticipationsCount,
            'target-profile-id': campaignManagement.targetProfileId,
            'target-profile-name': campaignManagement.targetProfileName,
            'total-participations-count': campaignManagement.totalParticipationsCount,
            code: campaignManagement.code,
            name: campaignManagement.name,
            title: campaignManagement.title,
            type: campaignManagement.type,
          },
        },
      });
    });
  });
});
