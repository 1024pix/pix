const organizationRepository = require('../../infrastructure/repositories/organization-repository.js');

module.exports = {
  async execute({
    organizationId,
    dependencies = {
      organizationRepository,
    },
  }) {
    const organization = await dependencies.organizationRepository.get(organizationId);

    return organization.isScoAndManagingStudents;
  },
};
