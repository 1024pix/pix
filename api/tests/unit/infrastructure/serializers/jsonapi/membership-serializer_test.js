const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/membership-serializer');
const Membership = require('../../../../../lib/domain/models/Membership');

describe('Unit | Serializer | JSONAPI | membership-serializer', () => {

  describe('#serialize', () => {

    it('should convert a Organization Access model object into JSON API data', () => {
      // given
      const membership = new Membership({
        id: 5,
        organization: {
          id: 10293,
          name: 'The name of the organization',
          type: 'SUP',
          code: 'WASABI666',
        }
      });

      const expectedSerializedMembership = {
        data: {
          type: 'memberships',
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
            },
            'target-profiles': {
              links: {
                related: '/organizations/10293/target-profiles'
              }
            }
          }
        }]
      };

      // when
      const json = serializer.serialize(membership);

      // then
      expect(json).to.deep.equal(expectedSerializedMembership);
    });
  });

});
