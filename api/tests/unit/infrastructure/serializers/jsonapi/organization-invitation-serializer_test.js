const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');

describe('Unit | Serializer | JSONAPI | organization-invitation-serializer', function() {

  describe('#serialize', function() {

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const invitationObject = domainBuilder.buildOrganizationInvitation();

    const jsonInvitationExpected = {
      data: {
        type: 'organization-invitations',
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        id: invitationObject.id.toString(),
        attributes: {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          'organization-id': invitationObject.organizationId,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          'organization-name': invitationObject.organizationName,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          email: invitationObject.email,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          status: invitationObject.status,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          'updated-at': invitationObject.updatedAt,
        },
      },
    };

    it('should convert a organization-invitation object into JSON API data', function() {
      // when
      const json = serializer.serialize(invitationObject);

      // then
      expect(json).to.deep.equal(jsonInvitationExpected);
    });
  });
});
