const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-accesses-serializer');
const OrganizationAccess = require('../../../../../lib/domain/models/OrganizationAccess');

describe('Unit | Serializer | JSONAPI | organizations-accesses-serializer', () => {

  describe('#serialize', () => {

    it('should convert a Organization Access model object into JSON API data', () => {
      // given
      const organizationAccess = new OrganizationAccess({
        id: 5,
        organization: {
          id: 10293,
          name: 'The name of the organization',
          type: 'SUP',
          code: 'WASABI666',
        }
      });

      const expectedSerializedOrganizationAccess = {
        data: {
          type: 'organization-accesses',
          id: 5,
          attributes: {},
          relationships: {
            organization: {
              data:
                {
                  type: 'organizations', id: '10293'
                },
            }
          }
        },
        included: [{
          type: 'organizations',
          id: '10293',
          attributes: {
            name: 'The name of the organization',
            type: 'SUP',
            code: 'WASABI666',
          },
          relationships: {
            campaigns: {
              links: {
                related: '/organizations/10293/campaigns'
              }
            }
          }
        }]
      };

      // when
      const json = serializer.serialize(organizationAccess);

      // then
      expect(json).to.deep.equal(expectedSerializedOrganizationAccess);
    });
  });

});
