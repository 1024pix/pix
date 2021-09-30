const AllowedCertificationCenterAccess = require('../../../../lib/domain/read-models/AllowedCertificationCenterAccess');

function buildAllowedCertificationCenterAccess({
  id = 123,
  name = 'Sunnydale Center',
  externalId = 'BUFFY_SLAYER',
  type = 'PRO',
  isRelatedToManagingStudentsOrganization = false,
  relatedOrganizationTags = [],
} = {}) {
  return new AllowedCertificationCenterAccess({
    id,
    name,
    externalId,
    type,
    isRelatedToManagingStudentsOrganization,
    relatedOrganizationTags,
  });
}

buildAllowedCertificationCenterAccess.notSco = function({
  type = 'NOT_SCO',
  isRelatedToManagingStudentsOrganization = true,
}) {
  return new AllowedCertificationCenterAccess({
    type,
    isRelatedToManagingStudentsOrganization,
  });
};

module.exports = buildAllowedCertificationCenterAccess;
