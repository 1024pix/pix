import { checkValidation } from '../validators/sup-organization-learner-validator';

class SupOrganizationLearner {
  constructor({
    firstName,
    middleName,
    thirdName,
    lastName,
    preferredLastName,
    studentNumber,
    email,
    birthdate,
    diploma,
    department,
    educationalTeam,
    group,
    studyScheme,
    organizationId,
  } = {}) {
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.lastName = lastName;
    this.preferredLastName = preferredLastName;
    this.studentNumber = studentNumber;
    this.email = email;
    this.birthdate = birthdate;
    this.diploma = diploma;
    this.department = department;
    this.educationalTeam = educationalTeam;
    this.group = group;
    this.studyScheme = studyScheme;
    this.organizationId = organizationId;
    checkValidation(this);
  }
}

export default SupOrganizationLearner;
