class SchoolingRegistration {

  constructor({
    id,
    // attributes
    lastName,
    preferredLastName,
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
    nationalStudentId,
    division,
    updatedAt,
    // references
    userId,
    organizationId,
  } = {}) {
    this.id = id;
    // attributes
    this.lastName = lastName;
    this.preferredLastName = preferredLastName;
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
    this.nationalStudentId = nationalStudentId;
    this.division = division;
    this.updatedAt = updatedAt;
    // references
    this.userId = userId;
    this.organizationId = organizationId;
  }
}

module.exports = SchoolingRegistration;
