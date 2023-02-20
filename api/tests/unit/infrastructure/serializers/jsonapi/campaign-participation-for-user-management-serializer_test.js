import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-for-user-management-serializer';

describe('Unit | Serializer | JSONAPI | campaign-participation-for-user-management-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a participation model object into JSON API data', function () {
      // given
      const participationForUserManagement = domainBuilder.buildCampaignParticipationForUserManagement({
        id: 123,
        status: 'SHARED',
        campaignId: 456,
        campaignCode: 'AZERTY123',
        createdAt: new Date('2020-10-10'),
        sharedAt: new Date('2020-10-11'),
        deletedAt: new Date('2020-10-12'),
        deletedBy: 666,
        deletedByFirstName: 'King',
        deletedByLastName: 'Cong',
        organizationLearnerFirstName: 'Some',
        organizationLearnerLastName: 'Learner',
      });

      // when
      const json = serializer.serialize([participationForUserManagement]);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            type: 'user-participations',
            id: participationForUserManagement.id.toString(),
            attributes: {
              'participant-external-id': participationForUserManagement.participantExternalId,
              status: participationForUserManagement.status,
              'campaign-id': participationForUserManagement.campaignId,
              'campaign-code': participationForUserManagement.campaignCode,
              'created-at': participationForUserManagement.createdAt,
              'shared-at': participationForUserManagement.sharedAt,
              'deleted-at': participationForUserManagement.deletedAt,
              'deleted-by': participationForUserManagement.deletedBy,
              'deleted-by-full-name': participationForUserManagement.deletedByFullName,
              'organization-learner-full-name': participationForUserManagement.organizationLearnerFullName,
            },
          },
        ],
      });
    });
  });
});
