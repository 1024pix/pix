class Certificate {
  constructor({
    id,
    firstName,
    middleName,
    thirdName,
    lastName,
    birthdate,
    nationalStudentId,
    status,
    pixScore,
    verificationCode,
    date,
    deliveredAt,
    certificationCenter,
    competenceResults = [],
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.middleName = middleName;
    this.thirdName = thirdName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.nationalStudentId = nationalStudentId;
    this.date = date;
    this.deliveredAt = deliveredAt;
    this.pixScore = pixScore;
    this.status = status;
    this.certificationCenter = certificationCenter;
    this.competenceResults = competenceResults;
    this.verificationCode = verificationCode;
  }
}

export default Certificate;
