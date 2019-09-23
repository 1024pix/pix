const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');

describe('Unit | Serializer | organization-serializer', () => {

  describe('#serialize', () => {

    it('should return a JSON API serialized organization', () => {
      // given
      const organization = domainBuilder.buildOrganization();
      const meta = { some: 'meta' };
      // when
      const serializedOrganization = serializer.serialize(organization, meta);

      // then
      expect(serializedOrganization).to.deep.equal({
        data: {
          type: 'organizations',
          id: organization.id.toString(),
          attributes: {
            'name': organization.name,
            'type': organization.type,
            'code': organization.code,
            'logo-url': organization.logoUrl,
            'external-id': organization.externalId,
            'province-code': organization.provinceCode,
            'is-managing-students': organization.isManagingStudents,
          },
          relationships: {
            user: { data: null },
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`
              }
            },
            students: {
              links: {
                related: `/api/organizations/${organization.id}/students`
              }
            }
          }
        },
        meta: {
          some: 'meta'
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

    it('should include serialized student data when organization has student', () => {
      // given
      const organization = domainBuilder.buildOrganization.withStudents();

      // when
      const serializedOrganization = serializer.serialize(organization);

      // then
      expect(serializedOrganization.data.relationships.students).to.be.ok;
    });
  });
});

