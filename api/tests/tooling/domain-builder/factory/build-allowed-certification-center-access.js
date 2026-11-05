import { AllowedCertificationCenterAccess } from '../../../../src/organizational-entities/domain/read-models/AllowedCertificationCenterAccess.js';

export const ALLOWED_CERTIFICATION_CENTER_ACCESS_BUILDER_DEFAULT_ID = 123;

export function buildAllowedCertificationCenterAccess({
  id = 123,
  name = 'Sunnydale Center',
  externalId = 'BUFFY_SLAYER',
  type = 'PRO',
  isRelatedToManagingStudentsOrganization = false,
  relatedOrganizationTags = [],
  habilitations = [],
  isInWhitelist,
  scoBlockedAccessDateCollege,
  scoBlockedAccessDateLycee,
} = {}) {
  return new AllowedCertificationCenterAccess({
    center: {
      id,
      name,
      externalId,
      type,
      habilitations,
      isInWhitelist,
    },
    isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags,
    scoBlockedAccessDateCollege,
    scoBlockedAccessDateLycee,
  });
}

buildAllowedCertificationCenterAccess.notSco = function ({
  type = 'NOT_SCO',
  isRelatedToManagingStudentsOrganization = true,
}) {
  return new AllowedCertificationCenterAccess({
    center: {
      type,
    },
    isRelatedToManagingStudentsOrganization,
  });
};
