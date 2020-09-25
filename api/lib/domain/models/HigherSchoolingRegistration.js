const { checkValidation } = require('../validators/higher-schooling-registration-validator');

class HigherSchoolingRegistration {
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
    isSupernumerary = false,
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
    this.isSupernumerary = isSupernumerary;
    checkValidation(this);
  }
}

module.exports = HigherSchoolingRegistration;
