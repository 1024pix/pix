module.exports = function createOrganization({ organization, organizationRepository }) {
  return organizationRepository.create(organization);
};
