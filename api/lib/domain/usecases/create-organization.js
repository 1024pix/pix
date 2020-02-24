const Organization = require('../models/Organization');
const organizationCreationValidator = require('../validators/organization-creation-validator');

module.exports = async function createOrganization({
  name,
  type,
  logoUrl,
  externalId,
  provinceCode,
  organizationRepository,
}) {
  organizationCreationValidator.validate({ name, type });
  const organization = new Organization({ name, type, logoUrl, externalId, provinceCode });
  return organizationRepository.create(organization);
};
