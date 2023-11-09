import { expect } from '../../../../../test-helper.js';
import { OrganizationParticipant } from '../../../../../../src/prescription/learner-list/domain/read-models/OrganizationParticipant.js';
import * as serializer from '../../../../../../lib/infrastructure/serializers/jsonapi/organization/organization-participants-serializer.js';
import { CampaignParticipationStatuses as campaignParticipationsStatuses } from '../../../../../../lib/domain/models/CampaignParticipationStatuses.js';
describe('Unit | Serializer | JSONAPI | organization-participants-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organization participant model object into JSON API data', function () {
      // given
      const organizationParticipants = [
        new OrganizationParticipant({
          id: 777,
          firstName: 'Alex',
          lastName: 'Vasquez',
          participationCount: 4,
          lastParticipationDate: '2021-03-05',
          campaignName: 'King Karam',
          campaignType: 'ASSESSMENT',
          participationStatus: campaignParticipationsStatuses.TO_SHARE,
          isCertifiable: null,
          certifiableAt: null,
        }),
        new OrganizationParticipant({
          id: 778,
          firstName: 'Sam',
          lastName: 'Simpson',
          participationCount: 3,
          lastParticipationDate: '2021-03-05',
          campaignName: 'King Xavier',
          campaignType: 'PROFILES_COLLECTION',
          participationStatus: campaignParticipationsStatuses.SHARED,
          isCertifiable: true,
          certifiableAt: '2021-03-04',
        }),
      ];
      const pagination = { page: { number: 1, pageSize: 2 } };
      const participantCount = 10;
      const meta = { ...pagination, participantCount };

      const expectedJSON = {
        data: [
          {
            type: 'organization-participants',
            id: organizationParticipants[0].id.toString(),
            attributes: {
              'first-name': organizationParticipants[0].firstName,
              'last-name': organizationParticipants[0].lastName,
              'participation-count': organizationParticipants[0].participationCount,
              'last-participation-date': organizationParticipants[0].lastParticipationDate,
              'campaign-name': organizationParticipants[0].campaignName,
              'campaign-type': organizationParticipants[0].campaignType,
              'participation-status': organizationParticipants[0].participationStatus,
              'is-certifiable': organizationParticipants[0].isCertifiable,
              'certifiable-at': organizationParticipants[0].certifiableAt,
            },
          },
          {
            type: 'organization-participants',
            id: organizationParticipants[1].id.toString(),
            attributes: {
              'first-name': organizationParticipants[1].firstName,
              'last-name': organizationParticipants[1].lastName,
              'participation-count': organizationParticipants[1].participationCount,
              'last-participation-date': organizationParticipants[1].lastParticipationDate,
              'campaign-name': organizationParticipants[1].campaignName,
              'campaign-type': organizationParticipants[1].campaignType,
              'participation-status': organizationParticipants[1].participationStatus,
              'is-certifiable': organizationParticipants[1].isCertifiable,
              'certifiable-at': organizationParticipants[1].certifiableAt,
            },
          },
        ],
        meta,
      };

      // when
      const json = serializer.serialize({ organizationParticipants, meta });

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
