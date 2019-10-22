const Organization = require('../models/Organization');
const organizationCreationValidator = require('../validators/organization-creation-validator');
const organizationService = require('../services/organization-service');

module.exports = function createOrganization({
  name,
  type,
  logoUrl,
  externalId,
  provinceCode,
  isManagingStudents,
  organizationRepository,
}) {

  return organizationCreationValidator.validate({ name, type })
    .then(() => organizationService.generateUniqueOrganizationCode({ organizationRepository }))
    .then((code) => new Organization({ name, type, code, logoUrl, externalId, provinceCode, isManagingStudents }))
    .then(organizationRepository.create);
};
