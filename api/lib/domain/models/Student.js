class Student {

  constructor({
    id,
    // attributes
    lastName,
    preferredName,
    firstName,
    middleName,
    thirdName,
    birthdate,
    birthCity,
    birthCityCode,
    birthProvinceCode,
    birthCountryCode,
    MEFCode,
    status,
    nationalId,
    nationalStudentId,
    schoolClass,
    // includes
    organization,
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.lastName = lastName;
    this.preferredName = preferredName;
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.birthdate = birthdate;
    this.birthCity = birthCity;
    this.birthCityCode = birthCityCode;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountryCode = birthCountryCode;
    this.MEFCode = MEFCode;
    this.status = status;
    this.nationalId = nationalId;
    this.nationalStudentId = nationalStudentId;
    this.schoolClass = schoolClass;
    // includes
    this.organization = organization;
    // references
  }
}

module.exports = Student;
