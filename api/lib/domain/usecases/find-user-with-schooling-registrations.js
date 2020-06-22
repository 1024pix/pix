module.exports =  function findUserWithSchoolingRegistrations({ 
  organizationId,
  filter,
  schoolingRegistrationRepository,
}) {
  return schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
    organizationId,
    filter,
  });
};
