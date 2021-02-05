const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(prescriber) {
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
            isCFA: recordWithoutClass.userOrgaSettings.currentOrganization.isCFA,
            isAEFE: recordWithoutClass.userOrgaSettings.currentOrganization.isAEFE,
            isMLF: recordWithoutClass.userOrgaSettings.currentOrganization.isMLF,
          },
        };
        delete recordWithoutClass.userOrgaSettings.currentOrganization;

        return recordWithoutClass;
      },

      attributes: [
        'firstName', 'lastName', 'pixOrgaTermsOfServiceAccepted', 'areNewYearSchoolingRegistrationsImported', 'lang',
        'memberships', 'userOrgaSettings',
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
          attributes: ['name', 'type', 'credit', 'isManagingStudents', 'canCollectProfiles', 'isAgriculture', 'isCFA', 'isAEFE', 'isMLF', 'targetProfiles', 'memberships', 'students', 'organizationInvitations'],
          memberships: {
            ref: 'id',
            ignoreRelationshipData: true,
            nullIfMissing: true,
            relationshipLinks: {
              related: function(record, current, parent) {
                return `/api/organizations/${parent.id}/memberships`;
              },
            },
          },
          organizationInvitations: {
            ref: 'id',
            ignoreRelationshipData: true,
            nullIfMissing: true,
            relationshipLinks: {
              related: function(record, current, parent) {
                return `/api/organizations/${parent.id}/invitations`;
              },
            },
          },
          students: {
            ref: 'id',
            ignoreRelationshipData: true,
            nullIfMissing: true,
            relationshipLinks: {
              related: function(record, current, parent) {
                return `/api/organizations/${parent.id}/students`;
              },
            },
          },
          targetProfiles: {
            ref: 'id',
            ignoreRelationshipData: true,
            nullIfMissing: true,
            relationshipLinks: {
              related: function(record, current, parent) {
                return `/api/organizations/${parent.id}/target-profiles`;
              },
            },
          },
        },
      },
    }).serialize(prescriber);
  },
};
