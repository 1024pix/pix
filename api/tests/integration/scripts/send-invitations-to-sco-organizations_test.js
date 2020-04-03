const _ = require('lodash');

const { expect, databaseBuilder, knex } = require('../../test-helper');

const BookshelfOrganizationInvitation = require('../../../lib/infrastructure/data/organization-invitation');
const {
  getOrganizationByExternalId, buildInvitation, prepareDataForSending, sendJoinOrganizationInvitations
} = require('../../../scripts/send-invitations-to-sco-organizations');

describe('Integration | Scripts | send-invitations-to-sco-organizations.js', () => {

  describe('#getOrganizationByExternalId', () => {

    it('should get organization by externalId', async () => {
      // given
      const externalId = '1234567A';
      const organization = databaseBuilder.factory.buildOrganization({ externalId });
      const expectedOrganization = _.omit(organization, ['createdAt', 'updatedAt']);

      await databaseBuilder.commit();

      // when
      const result = await getOrganizationByExternalId(externalId);

      // then
      expect(_.omit(result, ['memberships', 'organizationInvitations', 'students', 'targetProfileShares']))
        .to.deep.equal(expectedOrganization);
    });
  });

  describe('#buildInvitation', () => {

    it('should build invitation by externalId and email', async () => {
      // given
      const email = 'user@example.net';
      const externalId = '1234567A';
      const organizationId = databaseBuilder.factory.buildOrganization({ externalId }).id;
      const expectedInvitation = { organizationId, email };

      await databaseBuilder.commit();

      // when
      const invitation = await buildInvitation({ externalId, email });

      // then
      expect(invitation).to.deep.equal(expectedInvitation);
    });
  });

  describe('#prepareDataForSending', () => {

    it('should build a list of invitations with organizationId and email', async () => {
      // given
      const email1 = 'user1@example.net';
      const email2 = 'user2@example.net';
      const uaiA = '1234567A';
      const uaiB = '1234567B';

      const organizationAId = databaseBuilder.factory.buildOrganization({ externalId: uaiA }).id;
      const organizationBId = databaseBuilder.factory.buildOrganization({ externalId: uaiB }).id;

      const objectsFromFile = [
        { uai: uaiA, email: email1 },
        { uai: uaiB, email: email2 },
      ];
      const expectedInvitations = [
        { organizationId: organizationAId, email: email1 },
        { organizationId: organizationBId, email: email2 },
      ];

      await databaseBuilder.commit();

      // when
      const result = await prepareDataForSending(objectsFromFile);

      // then
      expect(result).to.deep.have.members(expectedInvitations);
    });
  });

  describe('#sendJoinOrganizationInvitations', () => {

    const getNumberOfOrganizationInvitations = () => {
      return BookshelfOrganizationInvitation.count()
        .then((number) => parseInt(number, 10));
    };

    afterEach(async () => {
      await knex('organization-invitations').delete();
    });

    it('should add organization invitations into database', async () => {
      // given
      const objectsForInvitations = ['user1@example', 'user2@example', 'user3@example', 'user4@example' ]
        .map((email) => {
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          return { organizationId, email };
        });

      const numberBefore = await getNumberOfOrganizationInvitations();
      const tags = ['test'];

      await databaseBuilder.commit();

      // when
      await sendJoinOrganizationInvitations(objectsForInvitations, tags);
      const numberAfter = await getNumberOfOrganizationInvitations();
      const invitationsCreatedInDatabase = numberAfter - numberBefore;

      // then
      expect(invitationsCreatedInDatabase).to.equal(objectsForInvitations.length);
    });
  });
});
