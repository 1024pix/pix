const { expect, domainBuilder } = require('../../../../test-helper');

const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/prescriber-serializer');
const Membership = require('../../../../../lib/domain/models/Membership');

describe('Unit | Serializer | JSONAPI | prescriber-serializer', () => {

  function createExpectedPrescriberSerialized({ prescriber, membership, userOrgaSettings, organization }) {
    return {
      data: {
        id: prescriber.id.toString(),
        type: 'prescribers',
        attributes: {
          'first-name': prescriber.firstName,
          'last-name': prescriber.lastName,
          'pix-orga-terms-of-service-accepted': prescriber.pixOrgaTermsOfServiceAccepted,
        },
        relationships: {
          memberships: {
            data: [{
              id: membership.id.toString(),
              type: 'memberships'
            }]
          },
          'user-orga-settings': {
            data: {
              id: userOrgaSettings.id.toString(),
              type: 'userOrgaSettings'
            }
          }
        }
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
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`
              }
            },
            'organization-invitations': {
              links: {
                related: `/api/organizations/${organization.id}/invitations`
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
                type: 'organizations'
              }
            }
          }
        },
        {
          id: userOrgaSettings.id.toString(),
          type: 'userOrgaSettings',
          attributes: {
            user: null
          },
          relationships: {
            organization: {
              data: null
            }
          }
        }
      ]
    };
  }

  describe('#serialize', () => {

    it('should return a JSON API serialized prescriber', () => {
      // given
      const user = domainBuilder.buildUser({
        pixOrgaTermsOfServiceAccepted: true,
        memberships: [],
        certificationCenterMemberships: [],
      });

      const organization = domainBuilder.buildOrganization();

      const membership = domainBuilder.buildMembership({
        organization,
        organizationRole: Membership.roles.MEMBER,
        user
      });

      user.memberships.push(membership);

      organization.memberships.push(membership);

      const userOrgaSettings = domainBuilder.buildUserOrgaSettings({
        currentOrganization: {},
      });
      userOrgaSettings.user = null;

      const prescriber = domainBuilder.buildPrescriber({
        firstName: user.firstName,
        lastName: user.lastName,
        pixOrgaTermsOfServiceAccepted:  user.pixOrgaTermsOfServiceAccepted,
        memberships: [membership],
        userOrgaSettings
      });

      const expectedPrescriberSerialized = createExpectedPrescriberSerialized({ prescriber, membership, userOrgaSettings, organization });

      // when
      const result = serializer.serialize(prescriber);

      // then
      expect(result).to.be.deep.equal(expectedPrescriberSerialized);
    });
  });

});
