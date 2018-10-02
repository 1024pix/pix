const Organization = require('../models/Organization');
const organizationValidator = require('../validators/organization-validator');
const organizationService = require('../services/organization-service');

module.exports = function createOrganization({ name, type, organizationRepository }) {

  return organizationValidator.validate({ name, type })
    .then(() => organizationService.generateUniqueOrganizationCode({ organizationRepository }))
    .then((code) => new Organization({ name, type, code }))
    .then((organization) => organizationRepository.create(organization));
};
