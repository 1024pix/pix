const Organization = require('../models/Organization');
const organizationCreationValidator = require('../validators/organization-creation-validator');

module.exports = async function createOrganization({
  createdBy,
  externalId,
  logoUrl,
  name,
  type,
  provinceCode,
  documentationUrl,
  organizationRepository,
}) {
  organizationCreationValidator.validate({ name, type, documentationUrl });
  const organization = new Organization({ createdBy, name, type, logoUrl, externalId, provinceCode, documentationUrl });
  return organizationRepository.create(organization);
};
