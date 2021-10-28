const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');

describe('Unit | Serializer | JSONAPI | organization-invitation-serializer', function () {
  describe('#serialize', function () {
    it('should convert a organization-invitation object into JSON API data', function () {
      // given
      const invitationObject = domainBuilder.buildOrganizationInvitation();

      // when
      const json = serializer.serialize(invitationObject);

      // then
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

      expect(json).to.deep.equal(jsonInvitationExpected);
    });
  });
  describe('#deserialize()', function () {
    it('should convert the payload json to organization invitation information', async function () {
      //given
      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            lang: 'fr-fr',
            email: 'EMAIL@example.net',
            role: null,
          },
        },
      };

      // when
      const json = await serializer.deserialize(payload);

      // then
      const expectedJsonApi = {
        lang: 'fr-fr',
        email: 'email@example.net',
        role: null,
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
