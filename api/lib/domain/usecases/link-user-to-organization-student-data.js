const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');
const { t1, t2 } = require('../services/validation-treatments');
const { t3 } = require('../services/validation-comparison');

module.exports = async function linkUserToOrganizationStudentData({
  campaignCode,
  user,
  campaignRepository,
  studentRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  const organizationId = campaign.organizationId;

  if (user.id === null) {
    throw new UserNotAuthorizedToAccessEntity('User is not part of the organization student list');
  }

  const studentsNotLinkedYetWithMatchingBirthdateAndOrganizationId = await studentRepository
    .findNotLinkedYetByOrganizationIdAndUserBirthdate({ organizationId, birthdate: user.birthdate });

  if (studentsNotLinkedYetWithMatchingBirthdateAndOrganizationId.length === 0) {
    throw new NotFoundError('Not found only 1 student');
  }

  const standardizedUser = {
    firstName: t2(t1(user.firstName)),
    lastName: t2(t1(user.lastName))
  };

  const foundStudentsStandardized = studentsNotLinkedYetWithMatchingBirthdateAndOrganizationId.map((student) => {
    return {
      id: student.id,
      firstName: student.firstName ? t2(t1(student.firstName)) : null,
      middleName: student.middleName ? t2(t1(student.middleName)) : null,
      thirdName: student.thirdName ? t2(t1(student.thirdName)) : null,
      lastName: student.lastName ? t2(t1(student.lastName)) : null,
      preferredLastName: student.preferredLastName ? t2(t1(student.preferredLastName)) : null,
    };
  });

  let foundStudents = foundStudentsStandardized.filter((student) => {
    if (student && student.firstName && student.lastName) {
      return hasT3Check(standardizedUser.firstName, student.firstName)
        && (hasT3Check(standardizedUser.lastName, student.lastName) || hasT3Check(standardizedUser.lastName, student.preferredLastName));
    }
  });

  if (foundStudents.length !== 1) {
    foundStudents = foundStudentsStandardized.filter((student) => {
      if (student.middleName && student.lastName) {
        return hasT3Check(standardizedUser.firstName, student.middleName) && (hasT3Check(standardizedUser.lastName, student.lastName) || hasT3Check(standardizedUser.lastName, student.preferredLastName));
      }
    });
  }

  if (foundStudents.length !== 1) {
    foundStudents = foundStudentsStandardized.filter((student) => {
      if (student.thirdName && student.lastName) {
        return hasT3Check(standardizedUser.firstName, student.thirdName) && (hasT3Check(standardizedUser.lastName, student.lastName) || hasT3Check(standardizedUser.lastName, student.preferredLastName));
      }
    });
  }

  if (foundStudents.length !== 1) {
    throw new NotFoundError('Not found only 1 student');
  }

  const matchedStudent = foundStudents[0];
  return studentRepository.associateUserAndStudent({ userId: user.id, studentId: matchedStudent.id });

  function hasT3Check(string1, string2) {
    return t3(string1, [string2]) <= 0.25;
  }
};
