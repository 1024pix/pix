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
            'logo-url': organization.logoUrl,
            'external-id': organization.externalId,
            'province-code': organization.provinceCode,
            'is-managing-students': organization.isManagingStudents,
            'credit': organization.credit,
            'can-collect-profiles': organization.canCollectProfiles
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`
              }
            },
            students: {
              links: {
                related: `/api/organizations/${organization.id}/students`
              }
            },
            'target-profiles': {
              links: {
                related: `/api/organizations/${organization.id}/target-profiles`
              }
            }
          }
        },
        meta: {
          some: 'meta'
        }
      });
    });

    it('should include serialized student data when organization has schoolingRegistration', () => {
      // given
      const organization = domainBuilder.buildOrganization.withSchoolingRegistrations();

      // when
      const serializedOrganization = serializer.serialize(organization);

      // then
      expect(serializedOrganization.data.relationships.students).to.be.ok;
    });
  });
});
