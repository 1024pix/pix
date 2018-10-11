const Organization = require('../models/Organization');
const organizationCreationValidator = require('../validators/organization-creation-validator');
const organizationService = require('../services/organization-service');

module.exports = function createOrganization({ name, type, organizationRepository }) {

  return organizationCreationValidator.validate({ name, type })
    .then(() => organizationService.generateUniqueOrganizationCode({ organizationRepository }))
    .then((code) => new Organization({ name, type, code }))
    .then(organizationRepository.create);
};
