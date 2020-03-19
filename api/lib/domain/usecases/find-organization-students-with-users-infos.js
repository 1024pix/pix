module.exports =  function findOrganizationStudentsWithUserInfos({ organizationId, studentRepository }) {

  return studentRepository.findStudentsWithUserInfoByOrganizationId({ organizationId });

};
