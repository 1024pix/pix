const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-orga-settings-serializer');
const UserOrgaSettings = require('../../../../../lib/domain/models/UserOrgaSettings');

describe('Unit | Serializer | JSONAPI | user-orga-settings-serializer', () => {

  describe('#serialize', () => {

    it('should convert a UserOrgaSettings model object into JSON API data', () => {
      // given
      const userOrgaSettings = new UserOrgaSettings({
        id: 5,
        currentOrganization: {
          id: 10293,
          name: 'The name of the organization',
          type: 'SUP',
          code: 'WASABI666',
          externalId: 'EXTID'
        },
      });

      const expectedSerializedUserOrgaSettings = {
        data: {
          type: 'user-orga-settings',
          id: '5',
          attributes: {},
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
      const json = serializer.serialize(userOrgaSettings);

      // then
      expect(json).to.deep.equal(expectedSerializedUserOrgaSettings);
    });

    it('should include "organization"', () => {
      // given
      const userOrgaSettings = domainBuilder.buildUserOrgaSettings();

      // when
      const json = serializer.serialize(userOrgaSettings);

      // then
      expect(json.data.relationships.organization.data.type).to.equal('organizations');
      expect(json.data.relationships.organization.data.id).to.equal(`${userOrgaSettings.organization.id}`);
      expect(json.included[0].type).to.equal('organizations');
      expect(json.included[0].attributes).to.deep.equal({
        'name': 'ACME',
        'type': 'PRO',
        'code': 'ABCD12',
        'external-id': 'EXTID',
        'is-managing-students': false
      });
    });

    it('should include "user"', () => {
      // given
      const userOrgaSettings = domainBuilder.buildUserOrgaSettings();

      // when
      const json = serializer.serialize(userOrgaSettings);

      // then
      expect(json.data.relationships.user.data.type).to.equal('users');
      expect(json.data.relationships.user.data.id).to.equal(`${userOrgaSettings.user.id}`);
      expect(json.included[1].type).to.equal('users');
      expect(json.included[1].attributes).to.deep.equal({
        'first-name': 'Jean',
        'last-name': 'Dupont',
        'email': 'jean.dupont@example.net',
      });
    });

    it('should not force the add of campaigns and target profiles relation links if the UserOrgaSettings does not contain organization data', () => {
      // given
      const userOrgaSettings = domainBuilder.buildUserOrgaSettings();
      userOrgaSettings.currentOrganization = null;

      // when
      const json = serializer.serialize(userOrgaSettings);

      // then
      expect(json.data.relationships.organization.data).to.be.null;
    });
  });
});
