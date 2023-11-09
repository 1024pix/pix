import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (prescriber) {
  return new Serializer('prescriber', {
    transform: (record) => {
      const recordWithoutClass = { ...record };
      recordWithoutClass.memberships.forEach((membership) => {
        membership.organization = { ...membership.organization };
      });
      recordWithoutClass.userOrgaSettings = {
        ...recordWithoutClass.userOrgaSettings,
        organization: {
          ...recordWithoutClass.userOrgaSettings.currentOrganization,
          isAgriculture: recordWithoutClass.userOrgaSettings.currentOrganization.isAgriculture,
        },
      };
      delete recordWithoutClass.userOrgaSettings.currentOrganization;

      return recordWithoutClass;
    },

    attributes: [
      'firstName',
      'lastName',
      'pixOrgaTermsOfServiceAccepted',
      'areNewYearOrganizationLearnersImported',
      'participantCount',
      'lang',
      'memberships',
      'userOrgaSettings',
      'enableMultipleSendingAssessment',
      'computeOrganizationLearnerCertificability',
      'features',
    ],
    memberships: {
      ref: 'id',
      attributes: ['organizationRole', 'organization'],
      organization: {
        ref: 'id',
        attributes: ['name', 'externalId'],
      },
    },
    userOrgaSettings: {
      ref: 'id',
      attributes: ['organization', 'user'],
      organization: {
        ref: 'id',
        attributes: [
          'name',
          'type',
          'credit',
          'isManagingStudents',
          'isAgriculture',
          'identityProviderForCampaigns',
          'targetProfiles',
          'memberships',
          'divisions',
          'organizationInvitations',
          'documentationUrl',
          'groups',
        ],
        memberships: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/memberships`;
            },
          },
        },
        organizationInvitations: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/invitations`;
            },
          },
        },
        targetProfiles: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/target-profiles`;
            },
          },
        },
        groups: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/groups`;
            },
          },
        },
        divisions: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related(record, current, parent) {
              return `/api/organizations/${parent.id}/divisions`;
            },
          },
        },
      },
    },
  }).serialize(prescriber);
};

export { serialize };
