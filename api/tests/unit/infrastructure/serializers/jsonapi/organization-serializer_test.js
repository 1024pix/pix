const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');

describe('Unit | Serializer | organization-serializer', () => {

  describe('#serialize', () => {

    it('should return a JSON API serialized organization', () => {
      // given
      const organization = domainBuilder.buildOrganization();

      // when
      const serializedOrganization = serializer.serialize(organization);

      // then
      expect(serializedOrganization).to.deep.equal({
        data: {
          type: 'organizations',
          id: organization.id,
          attributes: {
            'name': organization.name,
            'type': organization.type,
            'code': organization.code,
            'logo-url': organization.logoUrl,
          },
          relationships: {
            user: { data: null },
            members: { data: [] }
          }
        }
      });
    });

    it('should include serialized user data when organization has a user', () => {
      // given
      const organization = domainBuilder.buildOrganization.withUser();

      // when
      const serializedOrganization = serializer.serialize(organization);

      // then
      expect(serializedOrganization.data.relationships.user).to.deep.equal({
        data: {
          id: '1',
          type: 'users'
        }
      });
      expect(serializedOrganization.included).to.deep.equal([
        {
          id: '1',
          type: 'users',
          attributes: {
            'first-name': 'Jean',
            'last-name': 'Bono',
            'email': 'jean.bono@example.net'
          }
        },
      ]);
    });

    it('should include serialized members data with organization has a members', () => {
      // given
      const organization = domainBuilder.buildOrganization.withMembers();

      // when
      const serializedOrganization = serializer.serialize(organization);

      // then
      expect(serializedOrganization.data.relationships.members).to.deep.equal({
        data: [{
          id: '1',
          type: 'users'
        }, {
          id: '2',
          type: 'users'
        }]
      });
      expect(serializedOrganization.included).to.deep.equal([
        {
          id: '1',
          type: 'users',
          attributes: {
            'first-name': 'John',
            'last-name': 'Doe',
            'email': 'john.doe@example.com'
          }
        },
        {
          id: '2',
          type: 'users',
          attributes: {
            'first-name': 'Jane',
            'last-name': 'Smith',
            'email': 'jane.smith@example.com'
          }
        }
      ]);
    });
  });
});

