const STATUS = {
  STUDENT: 'ST',
  APPRENTICE: 'AP',
};
class SchoolingRegistration {

  constructor({
    id,
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
    nationalApprenticeId,
    division,
    updatedAt,
    userId,
    organizationId,
  } = {}) {
    this.id = id;
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
    this.nationalApprenticeId = nationalApprenticeId;
    this.division = division;
    this.updatedAt = updatedAt;
    this.userId = userId;
    this.organizationId = organizationId;
  }
}

SchoolingRegistration.STATUS = STATUS;

module.exports = SchoolingRegistration;
