import jsonapiSerializer from 'jsonapi-serializer';

import { Organization } from '../../../../organizational-entities/domain/models/Organization.js';

const { Serializer } = jsonapiSerializer;

/**
 * @param {Prescriber} prescriber
 * @return {Object}
 */
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
      'pixOrgaTermsOfServiceStatus',
      'pixOrgaTermsOfServiceDocumentPath',
      'areNewYearOrganizationLearnersImported',
      'participantCount',
      'lang',
      'memberships',
      'userOrgaSettings',
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
          'combinedCourseBlueprints',
          'memberships',
          'divisions',
          'organizationInvitations',
          'documentationUrl',
          'participationStatistics',
          'groups',
          'schoolCode',
          'combinedCourses',
          'sessionExpirationDate',
          'learnerFiltersOptions',
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
        combinedCourseBlueprints: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/combined-course-blueprints`;
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
              if (parent.attributes.type === Organization.types.SCO1D) {
                return `/api/pix1d/schools/${parent.id}/divisions`;
              }
              return `/api/organizations/${parent.id}/divisions`;
            },
          },
        },
        participationStatistics: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/participation-statistics`;
            },
          },
        },
        combinedCourses: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/combined-courses`;
            },
          },
        },
        learnerFiltersOptions: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related: function (record, current, parent) {
              return `/api/organizations/${parent.id}/organization-learners/filters`;
            },
          },
        },
      },
    },
  }).serialize(prescriber);
};

export const prescriberSerializer = { serialize };
