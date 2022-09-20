class CleaCertifiedCandidate {
  constructor({
    firstName,
    lastName,
    email,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    sex,
    createdAt,
  } = {}) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.birthPostalCode = birthPostalCode;
    this.birthINSEECode = birthINSEECode;
    this.birthCountry = birthCountry;
    this.sex = sex;
    this.createdAt = createdAt;
  }

  get isBornInAForeignCountry() {
    const INSEECodeForeignCountry = '99';

    if (this.birthINSEECode.startsWith(INSEECodeForeignCountry)) {
      return true;
    }
    return false;
  }

  get geographicAreaOfBirthCode() {
    if (this.isBornInAForeignCountry) {
      const index = this.birthINSEECode.charAt(2);
      return `${index}00`;
    }
    return null;
  }

  get isBornInFrenchOutermostRegion() {
    const INSEECodeFrenchOutermostRegion = ['97', '98'];

    return (
      this.birthINSEECode.startsWith(INSEECodeFrenchOutermostRegion[0]) ||
      this.birthINSEECode.startsWith(INSEECodeFrenchOutermostRegion[1])
    );
  }
}

module.exports = CleaCertifiedCandidate;
