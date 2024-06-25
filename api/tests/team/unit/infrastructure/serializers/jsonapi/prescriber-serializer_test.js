import { Membership, Organization } from '../../../../../../lib/domain/models/index.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import { prescriberSerializer } from '../../../../../../src/team/infrastructure/serializers/jsonapi/prescriber-serializer.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Team | Infrastructure | Serializer | JSONAPI | prescriber', function () {
  describe('#serialize', function () {
    let user;

    beforeEach(function () {
      user = domainBuilder.buildUser({
        pixOrgaTermsOfServiceAccepted: true,
        memberships: [],
        certificationCenterMemberships: [],
      });
    });

    context('when isManagingStudents is true', function () {
      it('should serialize prescriber with isManagingStudents', function () {
        // given
        const organization = domainBuilder.buildOrganization({ isManagingStudents: true });

        const membership = domainBuilder.buildMembership({
          organization,
          organizationRole: Membership.roles.MEMBER,
          user,
        });

        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
          currentOrganization: organization,
        });
        userOrgaSettings.user = null;

        const prescriber = domainBuilder.buildPrescriber({
          firstName: user.firstName,
          lastName: user.lastName,
          areNewYearOrganizationLearnersImported: false,
          participantCount: 0,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
          features: {
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
          },
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({
          prescriber,
          membership,
          userOrgaSettings,
          organization,
          serializedField: 'is-managing-students',
          field: 'isManagingStudents',
        });

        // when
        const result = prescriberSerializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isAgriculture is true', function () {
      it('should serialize prescriber with isAgriculture', function () {
        // given
        const tags = [domainBuilder.buildTag({ name: 'AGRICULTURE' })];
        const organization = domainBuilder.buildOrganization({ tags });

        const membership = domainBuilder.buildMembership({
          organization,
          organizationRole: Membership.roles.MEMBER,
          user,
        });

        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
          currentOrganization: organization,
        });
        userOrgaSettings.user = null;

        const prescriber = domainBuilder.buildPrescriber({
          firstName: user.firstName,
          lastName: user.lastName,
          areNewYearOrganizationLearnersImported: false,
          participantCount: 0,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
          features: {
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
          },
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({
          prescriber,
          membership,
          userOrgaSettings,
          organization,
          serializedField: 'is-agriculture',
          field: 'isAgriculture',
        });

        // when
        const result = prescriberSerializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when organization has an identity provider for campaigns', function () {
      it('should serialize prescriber with identityProviderForCampaigns', function () {
        // given
        const organization = domainBuilder.buildOrganization({
          identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        });
        const membership = domainBuilder.buildMembership({ organization });

        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
          currentOrganization: organization,
        });
        userOrgaSettings.user = null;

        const prescriber = domainBuilder.buildPrescriber({
          memberships: [membership],
          userOrgaSettings,
          features: {
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
          },
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({
          prescriber,
          membership,
          userOrgaSettings,
          organization,
          serializedField: 'identity-provider-for-campaigns',
          field: 'identityProviderForCampaigns',
        });

        // when
        const result = prescriberSerializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when all booleans are false', function () {
      it('should serialize prescriber without these booleans', function () {
        // given
        const tags = [domainBuilder.buildTag({ name: 'OTHER' })];
        const organization = domainBuilder.buildOrganization({
          tags,
          isManagingStudents: false,
        });

        const membership = domainBuilder.buildMembership({
          organization,
          organizationRole: Membership.roles.MEMBER,
          user,
        });

        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
          currentOrganization: organization,
        });
        userOrgaSettings.user = null;

        const prescriber = domainBuilder.buildPrescriber({
          firstName: user.firstName,
          lastName: user.lastName,
          areNewYearOrganizationLearnersImported: false,
          participantCount: 0,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
          features: {
            [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
          },
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerialized({
          prescriber,
          membership,
          userOrgaSettings,
          organization,
        });

        // when
        const result = prescriberSerializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when organization is a school (type: SCO-1D)', function () {
      it('should serialize prescriber organization with school division link', function () {
        // given
        const organization = domainBuilder.buildOrganization({ type: Organization.types.SCO1D });

        const membership = domainBuilder.buildMembership({
          organization,
          organizationRole: Membership.roles.MEMBER,
          user,
        });

        const userOrgaSettings = domainBuilder.buildUserOrgaSettings({ currentOrganization: organization });

        const prescriber = domainBuilder.buildPrescriber({
          memberships: [membership],
          userOrgaSettings,
        });

        // when
        const result = prescriberSerializer.serialize(prescriber);

        // then
        expect(result.included[0].relationships.divisions.links.related).to.equal(
          `/api/pix1d/schools/${organization.id}/divisions`,
        );
      });
    });
  });
});

function createExpectedPrescriberSerializedWithOneMoreField({
  prescriber,
  membership,
  userOrgaSettings,
  organization,
  serializedField,
  field,
}) {
  return {
    data: {
      id: prescriber.id.toString(),
      type: 'prescribers',
      attributes: {
        'first-name': prescriber.firstName,
        'last-name': prescriber.lastName,
        'pix-orga-terms-of-service-accepted': prescriber.pixOrgaTermsOfServiceAccepted,
        'are-new-year-organization-learners-imported': prescriber.areNewYearOrganizationLearnersImported,
        'participant-count': prescriber.participantCount,
        lang: prescriber.lang,
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: prescriber.features.MULTIPLE_SENDING_ASSESSMENT,
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]:
            prescriber.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY,
        },
      },
      relationships: {
        memberships: {
          data: [
            {
              id: membership.id.toString(),
              type: 'memberships',
            },
          ],
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
          'external-id': organization.externalId,
          name: organization.name,
          type: organization.type,
          credit: organization.credit,
          'documentation-url': organization.documentationUrl,
          [serializedField]: organization[field],
        },
        relationships: {
          divisions: {
            links: {
              related: `/api/organizations/${organization.id}/divisions`,
            },
          },
          memberships: {
            links: {
              related: `/api/organizations/${organization.id}/memberships`,
            },
          },
          groups: {
            links: {
              related: '/api/organizations/123/groups',
            },
          },
          'organization-invitations': {
            links: {
              related: `/api/organizations/${organization.id}/invitations`,
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
        'are-new-year-organization-learners-imported': prescriber.areNewYearOrganizationLearnersImported,
        'participant-count': prescriber.participantCount,
        lang: prescriber.lang,
        features: {
          [ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: prescriber.features.MULTIPLE_SENDING_ASSESSMENT,
          [ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]:
            prescriber.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY,
        },
      },
      relationships: {
        memberships: {
          data: [
            {
              id: membership.id.toString(),
              type: 'memberships',
            },
          ],
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
          'external-id': organization.externalId,
          name: organization.name,
          type: organization.type,
          credit: organization.credit,
          'documentation-url': organization.documentationUrl,
        },
        relationships: {
          divisions: {
            links: {
              related: `/api/organizations/${organization.id}/divisions`,
            },
          },
          memberships: {
            links: {
              related: `/api/organizations/${organization.id}/memberships`,
            },
          },
          groups: {
            links: {
              related: '/api/organizations/123/groups',
            },
          },
          'organization-invitations': {
            links: {
              related: `/api/organizations/${organization.id}/invitations`,
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
