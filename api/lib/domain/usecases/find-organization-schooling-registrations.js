module.exports = async function findOrganizationSchoolingRegistrations({ organizationId, schoolingRegistrationRepository }) {

  const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationId({ organizationId });

  return schoolingRegistrations;
};
