module.exports =  function findPaginatedFilteredSchoolingRegistrations({ 
  organizationId,
  filter,
  page,
  schoolingRegistrationRepository,
}) {
  return schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations({
    organizationId,
    filter,
    page,
  });
};
