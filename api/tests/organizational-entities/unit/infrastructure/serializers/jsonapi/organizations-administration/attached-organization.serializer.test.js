import { AttachedOrganization } from '../../../../../../../src/organizational-entities/domain/models/AttachedOrganization.js';
import { attachedOrganizationSerializer } from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/attached-organization.serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | Serializers | JSONAPI | Organizations-Administrations | attached-organization', function () {
  describe('#serialize', function () {
    it('should convert an array of AttachedOrganization models into JSON API data', function () {
      // given
      const firstOrganization = new AttachedOrganization({
        id: 1,
        name: 'My attached organization',
        externalId: 'EXT123',
      });
      const secondOrganization = new AttachedOrganization({
        id: 2,
        name: 'My other organization',
        externalId: 'EXT456',
      });
      const organizations = [firstOrganization, secondOrganization];

      const expectedJSON = {
        data: [
          {
            type: 'attached-organizations',
            id: '1',
            attributes: {
              name: 'My attached organization',
              'external-id': 'EXT123',
            },
          },
          {
            type: 'attached-organizations',
            id: '2',
            attributes: {
              name: 'My other organization',
              'external-id': 'EXT456',
            },
          },
        ],
      };

      // when
      const json = attachedOrganizationSerializer.serialize(organizations);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
