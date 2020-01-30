const Organization = require('../models/Organization');
const organizationCreationValidator = require('../validators/organization-creation-validator');
const organizationService = require('../services/organization-service');

module.exports = async function createOrganization({
  name,
  type,
  logoUrl,
  externalId,
  provinceCode,
  organizationRepository,
}) {
  organizationCreationValidator.validate({ name, type });
  return organizationService.generateUniqueOrganizationCode({ organizationRepository })
    .then((code) => new Organization({ name, type, code, logoUrl, externalId, provinceCode }))
    .then(organizationRepository.create);
};
