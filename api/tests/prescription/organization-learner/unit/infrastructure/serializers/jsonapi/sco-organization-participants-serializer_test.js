import { ScoOrganizationParticipant } from '../../../../../../../src/prescription/organization-learner/domain/read-models/ScoOrganizationParticipant.js';
import { scoOrganizationParticipantsSerializer } from '../../../../../../../src/prescription/organization-learner/infrastructure/serializers/jsonapi/sco-organization-participants-serializer.js';
import { CampaignParticipationStatuses as campaignParticipationsStatuses } from '../../../../../../../src/prescription/shared/domain/constants.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | sco-organization-participants-serializer', function () {
  describe('#serialize', function () {
    it('should convert a sco organization participant model object into JSON API data', function () {
      // given
      const firstParticipant = new ScoOrganizationParticipant({
        id: 777,
        firstName: 'Alex',
        lastName: 'Vasquez',
        birthdate: '2010-10-23',
        division: '4E',
        userId: 456,
        email: null,
        username: 'alexvasquez2310',
        isTemporarilyBlocked: true,
        isBlocked: false,
        isAuthenticatedFromGAR: true,
        participationCount: 4,
        lastParticipationDate: '2021-03-05',
        campaignName: 'King Karam',
        campaignType: 'ASSESSMENT',
        participationStatus: campaignParticipationsStatuses.STARTED,
        isCertifiable: null,
        certifiableAt: null,
      });
      const secondParticipant = new ScoOrganizationParticipant({
        id: 778,
        firstName: 'Sam',
        lastName: 'Simpson',
        birthdate: '2010-10-13',
        division: '4L',
        userId: null,
        email: 'toto@example.net',
        username: null,
        isTemporarilyBlocked: false,
        isBlocked: true,
        isAuthenticatedFromGAR: false,
        participationCount: 3,
        lastParticipationDate: '2021-03-05',
        campaignName: 'King Xavier',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: campaignParticipationsStatuses.SHARED,
        isCertifiable: true,
        certifiableAt: '2021-03-04',
      });
      const scoOrganizationParticipants = [firstParticipant, secondParticipant];

      const pagination = { page: { number: 1, pageSize: 2 } };
      const participantCount = 10;
      const meta = { ...pagination, participantCount };

      const expectedJSON = {
        data: [
          {
            type: 'sco-organization-participants',
            id: firstParticipant.id.toString(),
            attributes: {
              'first-name': firstParticipant.firstName,
              'last-name': firstParticipant.lastName,
              birthdate: firstParticipant.birthdate,
              'user-id': firstParticipant.userId,
              division: firstParticipant.division,
              email: firstParticipant.email,
              username: firstParticipant.username,
              'is-temporarily-blocked': firstParticipant.isTemporarilyBlocked,
              'is-blocked': firstParticipant.isBlocked,
              'is-authenticated-from-gar': firstParticipant.isAuthenticatedFromGAR,
              'participation-count': firstParticipant.participationCount,
              'last-participation-date': firstParticipant.lastParticipationDate,
              'campaign-name': firstParticipant.campaignName,
              'campaign-type': firstParticipant.campaignType,
              'participation-status': firstParticipant.participationStatus,
              'is-certifiable': firstParticipant.isCertifiable,
              'certifiable-at': firstParticipant.certifiableAt,
            },
          },
          {
            type: 'sco-organization-participants',
            id: secondParticipant.id.toString(),
            attributes: {
              'first-name': secondParticipant.firstName,
              'last-name': secondParticipant.lastName,
              birthdate: secondParticipant.birthdate,
              division: secondParticipant.division,
              'user-id': secondParticipant.userId,
              email: secondParticipant.email,
              username: secondParticipant.username,
              'is-temporarily-blocked': secondParticipant.isTemporarilyBlocked,
              'is-blocked': secondParticipant.isBlocked,
              'is-authenticated-from-gar': secondParticipant.isAuthenticatedFromGAR,
              'participation-count': secondParticipant.participationCount,
              'last-participation-date': secondParticipant.lastParticipationDate,
              'campaign-name': secondParticipant.campaignName,
              'campaign-type': secondParticipant.campaignType,
              'participation-status': secondParticipant.participationStatus,
              'is-certifiable': secondParticipant.isCertifiable,
              'certifiable-at': secondParticipant.certifiableAt,
            },
          },
        ],
        meta,
      };

      // when
      const json = scoOrganizationParticipantsSerializer.serialize({ scoOrganizationParticipants, meta });

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
