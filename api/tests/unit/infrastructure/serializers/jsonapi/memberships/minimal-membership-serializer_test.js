const { expect, domainBuilder } = require('../../../../../test-helper');
const serializer = require('../../../../../../lib/infrastructure/serializers/jsonapi/memberships/minimal-membership-serializer');
const Membership = require('../../../../../../lib/domain/models/Membership');

describe('Unit | Serializer | JSONAPI | membership-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Membership model object into JSON API data', function () {
      // given
      const membership = new Membership({
        id: 5,
        organization: {
          id: 10293,
          name: 'The name of the organization',
          type: 'SUP',
          code: 'WASABI666',
          externalId: 'EXTID',
        },
        organizationRole: Membership.roles.ADMIN,
        user: {
          id: 123,
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email',
        },
      });

      const expectedSerializedMembership = {
        data: {
          type: 'memberships',
          id: '5',
          attributes: {
            'organization-role': Membership.roles.ADMIN,
          },
          relationships: {
            user: {
              data: {
                id: '123',
                type: 'users',
              },
            },
          },
        },
        included: [
          {
            type: 'users',
            id: '123',
            attributes: {
              'first-name': 'firstName',
              'last-name': 'lastName',
              email: 'email',
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(membership);

      // then
      expect(json).to.deep.equal(expectedSerializedMembership);
    });

    it('should include "user"', function () {
      // given
      const membership = domainBuilder.buildMembership({
        user: domainBuilder.buildUser({ firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.net' }),
      });

      // when
      const json = serializer.serialize(membership);
      // then
      expect(json.data.relationships.user.data.type).to.equal('users');
      expect(json.data.relationships.user.data.id).to.equal(`${membership.user.id}`);
      expect(json.included[0].type).to.equal('users');
      expect(json.included[0].attributes).to.deep.equal({
        'first-name': 'Jean',
        'last-name': 'Dupont',
        email: 'jean.dupont@example.net',
      });
    });
  });
});
