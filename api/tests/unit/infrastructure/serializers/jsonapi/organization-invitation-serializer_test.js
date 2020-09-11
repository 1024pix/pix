const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');

describe('Unit | Serializer | JSONAPI | organization-invitation-serializer', () => {

  describe('#serialize', () => {

    const invitationObject = domainBuilder.buildOrganizationInvitation();

    const jsonInvitationExpected = {
      data: {
        type: 'organization-invitations',
        id: invitationObject.id.toString(),
        attributes: {
          'organization-id': invitationObject.organizationId,
          'organization-name': invitationObject.organizationName,
          email: invitationObject.email,
          status: invitationObject.status,
          'updated-at': invitationObject.updatedAt,
        },
      },
    };

    it('should convert a organization-invitation object into JSON API data', () => {
      // when
      const json = serializer.serialize(invitationObject);

      // then
      expect(json).to.deep.equal(jsonInvitationExpected);
    });
  });
});
