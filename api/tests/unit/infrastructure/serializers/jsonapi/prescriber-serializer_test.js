const { expect, domainBuilder } = require('../../../../test-helper');

const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/prescriber-serializer');
const Membership = require('../../../../../lib/domain/models/Membership');

describe('Unit | Serializer | JSONAPI | prescriber-serializer', () => {

  function createExpectedPrescriberSerializedWithIsAgriculture({ prescriber, membership, userOrgaSettings, organization }) {
    return {
      data: {
        id: prescriber.id.toString(),
        type: 'prescribers',
        attributes: {
          'first-name': prescriber.firstName,
          'last-name': prescriber.lastName,
          'pix-orga-terms-of-service-accepted': prescriber.pixOrgaTermsOfServiceAccepted,
          'are-new-year-schooling-registrations-imported': prescriber.areNewYearSchoolingRegistrationsImported,
        },
        relationships: {
          memberships: {
            data: [{
              id: membership.id.toString(),
              type: 'memberships',
            }],
          },
          'user-orga-settings': {
            data: {
              id: userOrgaSettings.id.toString(),
              type: 'userOrgaSettings',
            },
          },
        },
      },
      included: [
        {
          id: organization.id.toString(),
          type: 'organizations',
          attributes: {
            'can-collect-profiles': organization.canCollectProfiles,
            'external-id': organization.externalId,
            'is-managing-students': organization.isManagingStudents,
            'name': organization.name,
            'type': organization.type,
            'credit': organization.credit,
            'is-agriculture': true,
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`,
              },
            },
            'organization-invitations': {
              links: {
                related: `/api/organizations/${organization.id}/invitations`,
              },
            },
            students: {
              links: {
                related: `/api/organizations/${organization.id}/students`,
              },
            },
            'target-profiles': {
              links: {
                related: `/api/organizations/${organization.id}/target-profiles`,
              },
            },
          },
        },
        {
          id: membership.id.toString(),
          type: 'memberships',
          attributes: {
            'organization-role': membership.organizationRole,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
        {
          id: userOrgaSettings.id.toString(),
          type: 'userOrgaSettings',
          attributes: {
            user: null,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
      ],
    };
  }

  function createExpectedPrescriberSerialized({ prescriber, membership, userOrgaSettings, organization }) {
    return {
      data: {
        id: prescriber.id.toString(),
        type: 'prescribers',
        attributes: {
          'first-name': prescriber.firstName,
          'last-name': prescriber.lastName,
          'pix-orga-terms-of-service-accepted': prescriber.pixOrgaTermsOfServiceAccepted,
          'are-new-year-schooling-registrations-imported': prescriber.areNewYearSchoolingRegistrationsImported,
        },
        relationships: {
          memberships: {
            data: [{
              id: membership.id.toString(),
              type: 'memberships',
            }],
          },
          'user-orga-settings': {
            data: {
              id: userOrgaSettings.id.toString(),
              type: 'userOrgaSettings',
            },
          },
        },
      },
      included: [
        {
          id: organization.id.toString(),
          type: 'organizations',
          attributes: {
            'can-collect-profiles': organization.canCollectProfiles,
            'external-id': organization.externalId,
            'is-managing-students': organization.isManagingStudents,
            'name': organization.name,
            'type': organization.type,
            'credit': organization.credit,
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`,
              },
            },
            'organization-invitations': {
              links: {
                related: `/api/organizations/${organization.id}/invitations`,
              },
            },
            students: {
              links: {
                related: `/api/organizations/${organization.id}/students`,
              },
            },
            'target-profiles': {
              links: {
                related: `/api/organizations/${organization.id}/target-profiles`,
              },
            },
          },
        },
        {
          id: membership.id.toString(),
          type: 'memberships',
          attributes: {
            'organization-role': membership.organizationRole,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
        {
          id: userOrgaSettings.id.toString(),
          type: 'userOrgaSettings',
          attributes: {
            user: null,
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations',
              },
            },
          },
        },
      ],
    };
  }

  describe('#serialize', () => {

    context('when isAgriculture should be true', () => {
      it('should serialize prescriber with isAgriculture', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

        const tags = [domainBuilder.buildTag({ name: 'AGRICULTURE' })];
        const organization = domainBuilder.buildOrganization({ tags });

        const membership = domainBuilder.buildMembership({
          organization,
          organizationRole: Membership.roles.MEMBER,
          user,
        });

        user.memberships.push(membership);

        organization.memberships.push(membership);

        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
          currentOrganization: organization,
        });
        userOrgaSettings.user = null;

        const prescriber = domainBuilder.buildPrescriber({
          firstName: user.firstName,
          lastName: user.lastName,
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const  expectedPrescriberSerialized = createExpectedPrescriberSerializedWithIsAgriculture({ prescriber, membership, userOrgaSettings, organization });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isAgriculture should be false', () => {
      it('should serialize prescriber without isAgriculture', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

        const tags = [domainBuilder.buildTag({ name: 'OTHER' })];
        const organization = domainBuilder.buildOrganization({ tags });

        const membership = domainBuilder.buildMembership({
          organization,
          organizationRole: Membership.roles.MEMBER,
          user,
        });

        user.memberships.push(membership);

        organization.memberships.push(membership);

        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
          currentOrganization: organization,
        });
        userOrgaSettings.user = null;

        const prescriber = domainBuilder.buildPrescriber({
          firstName: user.firstName,
          lastName: user.lastName,
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const  expectedPrescriberSerialized = createExpectedPrescriberSerialized({ prescriber, membership, userOrgaSettings, organization });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });
  });
});
