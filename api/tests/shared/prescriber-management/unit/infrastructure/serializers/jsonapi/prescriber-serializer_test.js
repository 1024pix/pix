import { expect, domainBuilder } from '../../../../../../test-helper.js';

import * as serializer from '../../../../../../../src/shared/prescriber-management/infrastructure/serializers/jsonapi/prescriber-serializer.js';
import { Membership } from '../../../../../../../lib/domain/models/index.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../../../lib/domain/constants/identity-providers.js';
import * as apps from '../../../../../../../lib/domain/constants.js';

describe('Unit | Serializer | JSONAPI | prescriber-serializer', function () {
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
            [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
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
        const result = serializer.serialize(prescriber);

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
            [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
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
        const result = serializer.serialize(prescriber);

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
            [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
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
        const result = serializer.serialize(prescriber);

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
          enableMultipleSendingAssessment: true,
          computeOrganizationLearnerCertificability: true,
          features: {
            [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: true,
            [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]: true,
          },
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerialized({
          prescriber,
          membership,
          userOrgaSettings,
          organization,
        });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
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
          [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: prescriber.features.MULTIPLE_SENDING_ASSESSMENT,
          [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]:
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
          [apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key]: prescriber.features.MULTIPLE_SENDING_ASSESSMENT,
          [apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key]:
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
