const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/sco-organization-invitation-serializer');

describe('Unit | Serializer | JSONAPI | sco-organization-invitation-serializer', () => {

  describe('#serialize', () => {

    const invitationObject = domainBuilder.buildOrganizationInvitation();

    const expectedInvitationJson = {
      data: {
        type: 'sco-organization-invitations',
        id: invitationObject.id.toString(),
      }
    };

    it('should convert an organization-invitation object into JSON API data', () => {
      // when
      const json = serializer.serialize(invitationObject);

      // then
      expect(json).to.deep.equal(expectedInvitationJson);
    });
  });
});
