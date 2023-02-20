import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/sco-organization-invitation-serializer';

describe('Unit | Serializer | JSONAPI | sco-organization-invitation-serializer', function () {
  describe('#serialize', function () {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const invitationObject = domainBuilder.buildOrganizationInvitation();

    const expectedInvitationJson = {
      data: {
        type: 'sco-organization-invitations',
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        id: invitationObject.id.toString(),
      },
    };

    it('should convert an organization-invitation object into JSON API data', function () {
      // when
      const json = serializer.serialize(invitationObject);

      // then
      expect(json).to.deep.equal(expectedInvitationJson);
    });
  });
});
