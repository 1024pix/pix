import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-details-management-serializer';

describe('Unit | Serializer | JSONAPI | campaign-details-management-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Campaign Detail Management model object into JSON API data', function () {
      // given
      const campaignManagement = {
        id: 'campaign_management_id',
        name: 'campaign',
        code: '123',
        type: 'ASSESSEMENT',
        title: 'Some title',
        idPixLabel: 'identifiant',
        archivedAt: new Date('2020-10-10'),
        createdAt: new Date('2020-10-10'),
        creatorFirstName: 'Ned',
        creatorLastName: 'Stark',
        organizationId: 123,
        organizationName: 'Orga',
        targetProfileId: 123,
        targetProfileName: 'TP',
        customLandingPageText: 'Welcome',
        customResultPageText: 'Finish',
        customResultPageButtonText: 'Click',
        customResultPageButtonUrl: 'www.pix.fr',
        sharedParticipationsCount: 5,
        totalParticipationsCount: 10,
        isTypeProfilesCollection: false,
        isTypeAssessment: true,
        multipleSendings: false,
      };

      // when
      const json = serializer.serialize(campaignManagement);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'campaigns',
          id: campaignManagement.id.toString(),
          attributes: {
            code: campaignManagement.code,
            name: campaignManagement.name,
            type: campaignManagement.type,
            title: campaignManagement.title,
            'id-pix-label': campaignManagement.idPixLabel,
            'archived-at': campaignManagement.archivedAt,
            'created-at': campaignManagement.createdAt,
            'creator-first-name': campaignManagement.creatorFirstName,
            'creator-last-name': campaignManagement.creatorLastName,
            'organization-id': campaignManagement.organizationId,
            'organization-name': campaignManagement.organizationName,
            'target-profile-id': campaignManagement.targetProfileId,
            'target-profile-name': campaignManagement.targetProfileName,
            'custom-landing-page-text': campaignManagement.customLandingPageText,
            'custom-result-page-text': campaignManagement.customResultPageText,
            'custom-result-page-button-text': campaignManagement.customResultPageButtonText,
            'custom-result-page-button-url': campaignManagement.customResultPageButtonUrl,
            'shared-participations-count': campaignManagement.sharedParticipationsCount,
            'total-participations-count': campaignManagement.totalParticipationsCount,
            'is-type-profiles-collection': false,
            'is-type-assessment': true,
            'multiple-sendings': campaignManagement.multipleSendings,
          },
        },
      });
    });
  });
});
