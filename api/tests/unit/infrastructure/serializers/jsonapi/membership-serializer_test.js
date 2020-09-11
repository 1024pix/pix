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
            organization: {
              data:
                {
                  type: 'organizations', id: '10293',
                },
            },
            user: {
              'data': {
                id: '123',
                type: 'users',
              },
            },
          },
        },
        included: [{
          type: 'organizations',
          id: '10293',
          attributes: {
            name: 'The name of the organization',
            type: 'SUP',
            code: 'WASABI666',
            'external-id': 'EXTID',
          },
          relationships: {
            campaigns: {
              links: {
                related: '/api/organizations/10293/campaigns',
              },
            },
            'target-profiles': {
              links: {
                related: '/api/organizations/10293/target-profiles',
              },
            },
            memberships: {
              links: {
                related: '/api/organizations/10293/memberships',
              },
            },
            students: {
              links: {
                related: '/api/organizations/10293/students',
              },
            },
            'organization-invitations': {
              links: {
                related: '/api/organizations/10293/invitations',
              },
            },
          },
        },
        {
          type: 'users',
          id: '123',
          attributes: {
            'first-name': 'firstName',
            'last-name': 'lastName',
            email: 'email',
          },
        }],
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
      expect(json.data.relationships.organization).to.be.undefined;
      expect(json.included.length).to.equal(1);
      expect(json.included[0].type).to.not.equal('organization');

    });

    it('should not force the add of user relation link if the user is undefined', () => {
      // given
      const membership = domainBuilder.buildMembership();
      membership.user = undefined;

      // when
      const json = serializer.serialize(membership);

      // then
      expect(json.data.relationships.user).to.be.undefined;
      expect(json.included.length).to.equal(1);
      expect(json.included[0].type).to.not.equal('users');
    });
  });

  describe('#deserialize()', () => {

    let jsonMembership = null;

    beforeEach(() => {
      jsonMembership = {
        data: {
          type: 'memberships',
          id: '12345',
          attributes: {
            'organization-role': 'ADMIN',
          },
        },
      };
    });

    it('should convert JSON API data into a map object that contain attribute to patch', () => {
      // when
      const membershipAttributes = serializer.deserialize(jsonMembership);

      // then
      expect(membershipAttributes.organizationRole).to.equal('ADMIN');
      expect(membershipAttributes.id).to.equal('12345');

    });
  });
});
