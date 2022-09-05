const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-for-admin-serializer');

describe('Unit | Serializer | organization-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('should return a JSON API serialized organization', function () {
      // given
      const tags = [
        domainBuilder.buildTag({ id: 7, name: 'AEFE' }),
        domainBuilder.buildTag({ id: 44, name: 'PUBLIC' }),
      ];
      const organization = domainBuilder.buildOrganizationForAdmin({
        email: 'sco.generic.account@example.net',
        tags,
        createdBy: 10,
        documentationUrl: 'https://pix.fr/',
        archivistFirstName: 'John',
        archivistLastName: 'Doe',
        identityProviderForCampaigns: 'super-idp',
      });
      const meta = { some: 'meta' };

      // when
      const serializedOrganization = serializer.serialize(organization, meta);

      // then
      expect(serializedOrganization).to.deep.equal({
        data: {
          type: 'organizations',
          id: organization.id.toString(),
          attributes: {
            name: organization.name,
            type: organization.type,
            'logo-url': organization.logoUrl,
            'external-id': organization.externalId,
            'province-code': organization.provinceCode,
            'is-managing-students': organization.isManagingStudents,
            credit: organization.credit,
            email: organization.email,
            'created-by': organization.createdBy,
            'created-at': organization.createdAt,
            'documentation-url': organization.documentationUrl,
            'show-nps': organization.showNPS,
            'form-nps-url': organization.formNPSUrl,
            'show-skills': organization.showSkills,
            'archived-at': organization.archivedAt,
            'archivist-full-name': organization.archivistFullName,
            'creator-full-name': organization.creatorFullName,
            'identity-provider-for-campaigns': 'super-idp',
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`,
              },
            },
            students: {
              links: {
                related: `/api/organizations/${organization.id}/students`,
              },
            },
            'target-profile-summaries': {
              links: {
                related: `/api/admin/organizations/${organization.id}/target-profile-summaries`,
              },
            },
            tags: {
              data: [
                {
                  id: tags[0].id.toString(),
                  type: 'tags',
                },
                {
                  id: tags[1].id.toString(),
                  type: 'tags',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              id: tags[0].id,
              name: tags[0].name,
            },
            id: tags[0].id.toString(),
            type: 'tags',
          },
          {
            attributes: {
              id: tags[1].id,
              name: tags[1].name,
            },
            id: tags[1].id.toString(),
            type: 'tags',
          },
        ],
        meta: {
          some: 'meta',
        },
      });
    });
  });
});
