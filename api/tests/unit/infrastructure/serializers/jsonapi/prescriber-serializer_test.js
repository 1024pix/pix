const { expect, domainBuilder } = require('../../../../test-helper');

const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/prescriber-serializer');
const Membership = require('../../../../../lib/domain/models/Membership');

describe('Unit | Serializer | JSONAPI | prescriber-serializer', () => {

  function createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField, field }) {
    return {
      data: {
        id: prescriber.id.toString(),
        type: 'prescribers',
        attributes: {
          'first-name': prescriber.firstName,
          'last-name': prescriber.lastName,
          'pix-orga-terms-of-service-accepted': prescriber.pixOrgaTermsOfServiceAccepted,
          'are-new-year-schooling-registrations-imported': prescriber.areNewYearSchoolingRegistrationsImported,
          'lang': prescriber.lang,
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
            'external-id': organization.externalId,
            'name': organization.name,
            'type': organization.type,
            'credit': organization.credit,
            [serializedField]: organization[field],
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
          'lang': prescriber.lang,
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
            'external-id': organization.externalId,
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

    context('when canCollectProfiles is true', () => {
      it('should serialize prescriber with canCollectProfiles', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

        const organization = domainBuilder.buildOrganization({ canCollectProfiles: true });

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
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField: 'can-collect-profiles', field: 'canCollectProfiles' });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isManagingStudents is true', () => {
      it('should serialize prescriber with isManagingStudents', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

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
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField: 'is-managing-students', field: 'isManagingStudents' });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isAgriculture is true', () => {
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

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField: 'is-agriculture', field: 'isAgriculture' });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isCFA is true', () => {
      it('should serialize prescriber with isCFA', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

        const tags = [domainBuilder.buildTag({ name: 'CFA' })];
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
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField: 'is-cfa', field: 'isCFA' });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isAEFE is true', () => {
      it('should serialize prescriber with isAEFE', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

        const tags = [domainBuilder.buildTag({ name: 'AEFE' })];
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
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField: 'is-aefe', field: 'isAEFE' });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isMLF is true', () => {
      it('should serialize prescriber with isMLF', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

        const tags = [domainBuilder.buildTag({ name: 'MLF' })];
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
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField: 'is-mlf', field: 'isMLF' });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when isMediationNumerique is true', () => {
      it('should serialize prescriber with isMediationNumerique', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
        });

        const tags = [domainBuilder.buildTag({ name: 'MEDNUM' })];
        const organization = domainBuilder.buildOrganization({ type: 'PRO', tags });

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
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          memberships: [membership],
          userOrgaSettings,
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerializedWithOneMoreField({ prescriber, membership, userOrgaSettings, organization, serializedField: 'is-mediation-numerique', field: 'isMediationNumerique' });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });

    context('when all booleans are false', () => {
      it('should serialize prescriber without these booleans', () => {
        // given
        const user = domainBuilder.buildUser({
          pixOrgaTermsOfServiceAccepted: true,
          memberships: [],
          certificationCenterMemberships: [],
          lang: 'someLanguage',
        });

        const tags = [domainBuilder.buildTag({ name: 'OTHER' })];
        const organization = domainBuilder.buildOrganization({ tags, isManagingStudents: false, canCollectProfiles: false });

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
          areNewYearSchoolingRegistrationsImported: false,
          pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
          lang: user.lang,
          memberships: [membership],
          userOrgaSettings,
        });

        const expectedPrescriberSerialized = createExpectedPrescriberSerialized({ prescriber, membership, userOrgaSettings, organization });

        // when
        const result = serializer.serialize(prescriber);

        // then
        expect(result).to.be.deep.equal(expectedPrescriberSerialized);
      });
    });
  });
});
