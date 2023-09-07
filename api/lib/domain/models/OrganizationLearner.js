const STATUS = {
  STUDENT: 'ST',
  APPRENTICE: 'AP',
};
class OrganizationLearner {
  constructor({
    id,
    lastName,
    preferredLastName,
    firstName,
    middleName,
    thirdName,
    sex = null,
    birthdate,
    birthCity,
    birthCityCode,
    birthProvinceCode,
    birthCountryCode,
    MEFCode,
    status,
    nationalStudentId,
    division,
    isDisabled,
    updatedAt,
    userId,
    organizationId,
    isCertifiable,
    certifiableAt,
  } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.preferredLastName = preferredLastName;
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.sex = sex;
    this.birthdate = birthdate;
    this.birthCity = birthCity;
    this.birthCityCode = birthCityCode;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountryCode = birthCountryCode;
    this.MEFCode = MEFCode;
    this.status = status;
    this.nationalStudentId = nationalStudentId;
    this.division = division;
    this.isDisabled = isDisabled;
    this.updatedAt = updatedAt;
    this.userId = userId;
    this.organizationId = organizationId;
    this.isCertifiable = isCertifiable;
    this.certifiableAt = certifiableAt;
  }

  updateCertificability(placementProfile) {
    this.certifiableAt = placementProfile.profileDate;
    this.isCertifiable = placementProfile.isCertifiable();
  }
}

OrganizationLearner.STATUS = STATUS;

export { OrganizationLearner };
