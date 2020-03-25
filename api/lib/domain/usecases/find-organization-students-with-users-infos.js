module.exports =  function findOrganizationStudentsWithUserInfos({ organizationId, schoolingRegistrationRepository }) {

  return schoolingRegistrationRepository.findSchoolingRegistrationsWithUserInfoByOrganizationId({ organizationId });

};
