class CertificationCandidate {
  #complementaryCertification = null;

  /**
   * @param {Object} param
   * @param {Array<Subscription>} param.subscriptions {@link Subscription>}
   */
  constructor({
    id,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    externalId,
    birthdate,
    extraTimePercentage,
    createdAt,
    authorizedToStart = false,
    sessionId,
    userId,
    organizationLearnerId = null,
    complementaryCertification = null,
    billingMode = null,
    prepaymentCode = null,
    subscriptions = [],
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthCity = birthCity;
    this.birthProvinceCode = birthProvinceCode;
    this.birthCountry = birthCountry;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.sex = sex;
    this.email = email;
    this.resultRecipientEmail = resultRecipientEmail;
    this.externalId = externalId;
    this.birthdate = birthdate;
    this.extraTimePercentage = extraTimePercentage;
    this.createdAt = createdAt;
    this.authorizedToStart = authorizedToStart;
    this.sessionId = sessionId;
    this.userId = userId;
    this.organizationLearnerId = organizationLearnerId;
    this.subscriptions = subscriptions;
    this.billingMode = billingMode;
    this.prepaymentCode = prepaymentCode;
  }
}

export class CertificationCandidateBuilder {
  constructor() {
    this.firstName = 'Lena';
    this.lastName = 'Rine';
    this.birthCity = 'Paris';
    this.birthCountry = 'France';
    this.birthPostalCode = '75001';
    this.birthINSEECode = '75101';
    this.birthProvinceCode = '11';
    this.sex = 'F';
    this.email = 'lena.rine@example.com';
    this.birthdate = '1990-05-15';
    this.externalId = null;
    this.extraTimePercentage = null;
    this.subscriptions = [];
  }

  withFirstName(firstName) {
    this.firstName = firstName;
    return this;
  }

  withLastName(lastName) {
    this.lastName = lastName;
    return this;
  }

  withBirthCity(birthCity) {
    this.birthCity = birthCity;
    return this;
  }

  withBirthCountry(birthCountry) {
    this.birthCountry = birthCountry;
    return this;
  }

  withBirthINSEECode(birthINSEECode) {
    this.birthINSEECode = birthINSEECode;
    return this;
  }

  withBirthPostalCode(birthPostalCode) {
    this.birthPostalCode = birthPostalCode;
    return this;
  }

  withBirthProvinceCode(birthProvinceCode) {
    this.birthProvinceCode = birthProvinceCode;
    return this;
  }

  withSex(sex) {
    this.sex = sex;
    return this;
  }

  withEmail(email) {
    this.email = email;
    return this;
  }

  withBirthdate(birthdate) {
    this.birthdate = birthdate;
    return this;
  }

  withExternalId(externalId) {
    this.externalId = externalId;
    return this;
  }

  withExtraTimePercentage(extraTimePercentage) {
    this.extraTimePercentage = extraTimePercentage;
    return this;
  }

  withSubscriptions(subscriptions) {
    this.subscriptions = subscriptions;
    return this;
  }

  build() {
    return new CertificationCandidate(this);
  }
}

// example
// const candidate = new CertificationCandidateBuilder()
//   .withEmail('coucou@test.fr')
//   .withExternalId('myExternalId')
//   .build();
// console.log(candidate);
