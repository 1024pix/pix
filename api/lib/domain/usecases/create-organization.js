const Organization = require('../models/Organization');
const organizationCreationValidator = require('../validators/organization-creation-validator');

module.exports = async function createOrganization({
  createdBy,
  externalId,
  logoUrl,
  name,
  type,
  provinceCode,
  organizationRepository,
}) {
  organizationCreationValidator.validate({ name, type });
  const organization = new Organization({ createdBy, name, type, logoUrl, externalId, provinceCode });
  return organizationRepository.create(organization);
};
