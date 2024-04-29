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
  isComplementaryAlonePilot = false,
} = {}) {
  return new AllowedCertificationCenterAccess({
    id,
    name,
    externalId,
    type,
    isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags,
    habilitations,
    isV3Pilot,
    isComplementaryAlonePilot,
  });
}

buildAllowedCertificationCenterAccess.notSco = function ({
  type = 'NOT_SCO',
  isRelatedToManagingStudentsOrganization = true,
}) {
  return new AllowedCertificationCenterAccess({
    type,
    isRelatedToManagingStudentsOrganization,
  });
};

export { ALLOWED_CERTIFICATION_CENTER_ACCESS_BUILDER_DEFAULT_ID, buildAllowedCertificationCenterAccess };
