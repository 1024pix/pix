module.exports =  function findUserWithSchoolingRegistrations({ organizationId, schoolingRegistrationRepository }) {

  return schoolingRegistrationRepository.findUserWithSchoolingRegistrationsByOrganizationId({ organizationId });

};
