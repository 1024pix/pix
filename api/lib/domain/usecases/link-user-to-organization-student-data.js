const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');

module.exports = async function linkUserToOrganizationStudentData({
  campaignCode,
  user,
  campaignRepository,
  studentRepository,
}) {
  let student;
  const campaign = await campaignRepository.getByCode(campaignCode);
  const organizationId = campaign.organizationId;

  if (user.id === null) {
    throw new UserNotAuthorizedToAccessEntity('User is not part of the organization student list');
  }

  const students = await studentRepository.findByOrganizationIdAndUserInformation({
    organizationId,
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: user.birthdate,
  });

  if (students.length === 1) {
    student = students[0];
  } else {
    throw new NotFoundError('Not found only 1 student');
  }

  return await studentRepository.associateUserAndStudent({ userId: user.id, studentId: student.id });
};
