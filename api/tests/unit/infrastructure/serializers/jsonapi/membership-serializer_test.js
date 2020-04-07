const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/membership-serializer');
const Membership = require('../../../../../lib/domain/models/Membership');

describe('Unit | Serializer | JSONAPI | membership-serializer', () => {

  describe('#serialize', () => {

    it('should convert a Membership model object into JSON API data', () => {
      // given
      const membership = new Membership({
        id: 5,
        organization: {
          id: 10293,
          name: 'The name of the organization',
          type: 'SUP',
          code: 'WASABI666',
          externalId: 'EXTID'
        },
        organizationRole: Membership.roles.ADMIN,
      });

      const expectedSerializedMembership = {
        data: {
          type: 'memberships',
          id: '5',
          attributes: {
            'organization-role': Membership.roles.ADMIN,
          },
          relationships: {
            organization: {
              data:
                {
                  type: 'organizations', id: '10293'
                },
            },
            user: {
              'data': null
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
            'external-id': 'EXTID'
          },
          relationships: {
            campaigns: {
              links: {
                related: '/api/organizations/10293/campaigns'
              }
            },
            'target-profiles': {
              links: {
                related: '/api/organizations/10293/target-profiles'
              }
            },
            memberships: {
              links: {
                related: '/api/organizations/10293/memberships'
              }
            },
            students: {
              links: {
                related: '/api/organizations/10293/students'
              }
            },
            'organization-invitations': {
              links: {
                related: '/api/organizations/10293/invitations',
              },
            },
          }
        }]
      };

      // when
      const json = serializer.serialize(membership);

      // then
      expect(json).to.deep.equal(expectedSerializedMembership);
    });

    it('should include "organization"', () => {
      // given
      const membership = domainBuilder.buildMembership();

      // when
      const json = serializer.serialize(membership);

      // then
      expect(json.data.relationships.organization.data.type).to.equal('organizations');
      expect(json.data.relationships.organization.data.id).to.equal(`${membership.organization.id}`);
      expect(json.included[0].type).to.equal('organizations');
      expect(json.included[0].attributes).to.deep.equal({
        'name': 'ACME',
        'type': 'PRO',
        'external-id': 'EXTID',
        'is-managing-students': false,
        'can-collect-profiles': false,
      });
    });

    it('should include "user"', () => {
      // given
      const membership = domainBuilder.buildMembership();

      // when
      const json = serializer.serialize(membership);

      // then
      expect(json.data.relationships.user.data.type).to.equal('users');
      expect(json.data.relationships.user.data.id).to.equal(`${membership.user.id}`);
      expect(json.included[1].type).to.equal('users');
      expect(json.included[1].attributes).to.deep.equal({
        'first-name': 'Jean',
        'last-name': 'Dupont',
        'email': 'jean.dupont@example.net',
      });
    });

    it('should not force the add of campaigns and target profiles relation links if the membership does not contain organization data', () => {
      // given
      const membership = domainBuilder.buildMembership();
      membership.organization = null;

      // when
      const json = serializer.serialize(membership);

      // then
      expect(json.data.relationships.organization.data).to.be.null;
    });
  });
});
