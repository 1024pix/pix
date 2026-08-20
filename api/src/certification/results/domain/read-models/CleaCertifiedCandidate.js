export class CleaCertifiedCandidate {
  constructor({
    firstName,
    lastName,
    resultRecipientEmail,
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
    this.resultRecipientEmail = resultRecipientEmail;
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

    return this.birthINSEECode?.startsWith(INSEECodeForeignCountry);
  }

  get geographicAreaOfBirthCode() {
    if (this.isBornInAForeignCountry) {
      const index = this.birthINSEECode.charAt(2);
      return `${index}00`;
    }
    return null;
  }

  get isBornInFrenchOutermostRegion() {
    return [this.birthPostalCode, this.birthINSEECode].some(isCodeStartsWithFrenchOutermostRegion);
  }
}

function isCodeStartsWithFrenchOutermostRegion(birthCode) {
  const INSEECodeFrenchOutermostRegion = ['97', '98'];
  return INSEECodeFrenchOutermostRegion.some((frenchOutermostRegion) => birthCode?.startsWith(frenchOutermostRegion));
}
