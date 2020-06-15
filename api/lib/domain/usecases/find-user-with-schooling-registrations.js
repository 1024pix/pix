module.exports =  function findUserWithSchoolingRegistrations({ 
  organizationId,
  filter,
  schoolingRegistrationRepository,
}) {
  return schoolingRegistrationRepository.findUserWithSchoolingRegistrationsByOrganizationId({
    organizationId,
    filter,
  });
};
