import { scoOrganizationInvitationSerializer } from '../../../../../../src/team/infrastructure/serializers/jsonapi/sco-organization-invitation.serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Team | Infrastructure | Serializer | JSONAPI | sco-organization-invitation', function () {
  describe('#serialize', function () {
    const invitationObject = domainBuilder.buildOrganizationInvitation();

    const expectedInvitationJson = {
      data: {
        type: 'sco-organization-invitations',

        id: invitationObject.id.toString(),
      },
    };

    it('should convert an organization-invitation object into JSON API data', function () {
      // when
      const json = scoOrganizationInvitationSerializer.serialize(invitationObject);

      // then
      expect(json).to.deep.equal(expectedInvitationJson);
    });
  });
});
