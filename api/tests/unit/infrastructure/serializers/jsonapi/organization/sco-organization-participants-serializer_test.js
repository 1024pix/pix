import { expect } from '../../../../../test-helper.js';
import { ScoOrganizationParticipant } from '../../../../../../src/prescription/learner-list/domain/read-models/ScoOrganizationParticipant.js';
import * as serializer from '../../../../../../lib/infrastructure/serializers/jsonapi/organization/sco-organization-participants-serializer.js';
import { CampaignParticipationStatuses as campaignParticipationsStatuses } from '../../../../../../lib/domain/models/CampaignParticipationStatuses.js';

describe('Unit | Serializer | JSONAPI | sco-organization-participants-serializer', function () {
  describe('#serialize', function () {
    it('should convert a sco organization participant model object into JSON API data', function () {
      // given
      const scoOrganizationParticipants = [
        new ScoOrganizationParticipant({
          id: 777,
          firstName: 'Alex',
          lastName: 'Vasquez',
          birthdate: '2010-10-23',
          division: '4E',
          userId: 456,
          email: null,
          username: 'alexvasquez2310',
          isAuthenticatedFromGAR: true,
          participationCount: 4,
          lastParticipationDate: '2021-03-05',
          campaignName: 'King Karam',
          campaignType: 'ASSESSMENT',
          participationStatus: campaignParticipationsStatuses.TO_SHARE,
          isCertifiable: null,
          certifiableAt: null,
        }),
        new ScoOrganizationParticipant({
          id: 778,
          firstName: 'Sam',
          lastName: 'Simpson',
          birthdate: '2010-10-13',
          division: '4L',
          userId: null,
          email: 'toto@example.net',
          username: null,
          isAuthenticatedFromGAR: false,
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
            type: 'sco-organization-participants',
            id: scoOrganizationParticipants[0].id.toString(),
            attributes: {
              'first-name': scoOrganizationParticipants[0].firstName,
              'last-name': scoOrganizationParticipants[0].lastName,
              birthdate: scoOrganizationParticipants[0].birthdate,
              'user-id': scoOrganizationParticipants[0].userId,
              division: scoOrganizationParticipants[0].division,
              email: scoOrganizationParticipants[0].email,
              username: scoOrganizationParticipants[0].username,
              'is-authenticated-from-gar': scoOrganizationParticipants[0].isAuthenticatedFromGAR,
              'participation-count': scoOrganizationParticipants[0].participationCount,
              'last-participation-date': scoOrganizationParticipants[0].lastParticipationDate,
              'campaign-name': scoOrganizationParticipants[0].campaignName,
              'campaign-type': scoOrganizationParticipants[0].campaignType,
              'participation-status': scoOrganizationParticipants[0].participationStatus,
              'is-certifiable': scoOrganizationParticipants[0].isCertifiable,
              'certifiable-at': scoOrganizationParticipants[0].certifiableAt,
            },
          },
          {
            type: 'sco-organization-participants',
            id: scoOrganizationParticipants[1].id.toString(),
            attributes: {
              'first-name': scoOrganizationParticipants[1].firstName,
              'last-name': scoOrganizationParticipants[1].lastName,
              birthdate: scoOrganizationParticipants[1].birthdate,
              division: scoOrganizationParticipants[1].division,
              'user-id': scoOrganizationParticipants[1].userId,
              email: scoOrganizationParticipants[1].email,
              username: scoOrganizationParticipants[1].username,
              'is-authenticated-from-gar': scoOrganizationParticipants[1].isAuthenticatedFromGAR,
              'participation-count': scoOrganizationParticipants[1].participationCount,
              'last-participation-date': scoOrganizationParticipants[1].lastParticipationDate,
              'campaign-name': scoOrganizationParticipants[1].campaignName,
              'campaign-type': scoOrganizationParticipants[1].campaignType,
              'participation-status': scoOrganizationParticipants[1].participationStatus,
              'is-certifiable': scoOrganizationParticipants[1].isCertifiable,
              'certifiable-at': scoOrganizationParticipants[1].certifiableAt,
            },
          },
        ],
        meta,
      };

      // when
      const json = serializer.serialize({ scoOrganizationParticipants, meta });

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
