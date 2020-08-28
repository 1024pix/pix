const { checkValidation } = require('../validators/higher-education-registration-validator');

class HigherEducationRegistration {
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
    this._validate();
  }

  _validate() {
    checkValidation({
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      studentNumber: this.studentNumber,
      email: this.email,
      isSupernumerary: this.isSupernumerary,
    });
  }
}

module.exports = HigherEducationRegistration;
