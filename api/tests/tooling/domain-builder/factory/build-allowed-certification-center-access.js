import { AllowedCertificationCenterAccess } from '../../../../lib/domain/read-models/AllowedCertificationCenterAccess.js';

const ALLOWED_CERTIFICATION_CENTER_ACCESS_BUILDER_DEFAULT_ID = 123;

function buildAllowedCertificationCenterAccess({
  id = 123,
  name = 'Sunnydale Center',
  externalId = 'BUFFY_SLAYER',
  type = 'PRO',
  isRelatedToManagingStudentsOrganization = false,
  relatedOrganizationTags = [],
  habilitations = [],
  isV3Pilot = false,
  features = [],
} = {}) {
  return new AllowedCertificationCenterAccess({
    center: {
      id,
      name,
      externalId,
      type,
      habilitations,
      isV3Pilot,
      features,
    },
    isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags,
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

export { ALLOWED_CERTIFICATION_CENTER_ACCESS_BUILDER_DEFAULT_ID, buildAllowedCertificationCenterAccess };
