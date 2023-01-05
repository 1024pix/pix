const _ = require('lodash');

const { expect, databaseBuilder, knex } = require('../../test-helper');

const BookshelfOrganizationInvitation = require('../../../lib/infrastructure/orm-models/OrganizationInvitation');
const {
  getOrganizationByExternalId,
  buildInvitation,
  prepareDataForSending,
  sendJoinOrganizationInvitations,
} = require('../../../scripts/send-invitations-to-sco-organizations');

describe('Integration | Scripts | send-invitations-to-sco-organizations.js', function () {
  describe('#getOrganizationByExternalId', function () {
    it('should get organization by externalId', async function () {
      // given
      const externalId = '1234567A';
      const organization = databaseBuilder.factory.buildOrganization({ externalId });
      const expectedOrganization = _.omit(organization, [
        'createdAt',
        'updatedAt',
        'email',
        'tags',
        'createdBy',
        'archivedBy',
        'identityProviderForCampaigns',
      ]);

      await databaseBuilder.commit();

      // when
      const result = await getOrganizationByExternalId(externalId);

      // then
      expect(
        _.omit(result, [
          'email',
          'memberships',
          'organizationInvitations',
          'students',
          'targetProfileShares',
          'tags',
          'createdBy',
          'identityProviderForCampaigns',
        ])
      ).to.deep.equal(expectedOrganization);
    });
  });

  describe('#buildInvitation', function () {
    it('should build invitation by externalId and email', async function () {
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

  describe('#prepareDataForSending', function () {
    it('should build a list of invitations with organizationId and email', async function () {
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

  describe('#sendJoinOrganizationInvitations', function () {
    const getNumberOfOrganizationInvitations = () => {
      return BookshelfOrganizationInvitation.count().then((number) => parseInt(number, 10));
    };

    afterEach(async function () {
      await knex('organization-invitations').delete();
    });

    it('should add organization invitations into database', async function () {
      // given
      const objectsForInvitations = [
        'user1@example.net',
        'user2@example.net',
        'user3@example.net',
        'user4@example.net',
      ].map((email) => {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        return { organizationId, email };
      });

      const numberBefore = await getNumberOfOrganizationInvitations();
      const tags = ['TEST'];

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
