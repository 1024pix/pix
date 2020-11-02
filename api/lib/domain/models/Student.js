class Student {

  constructor({
    nationalApprenticeId,
    nationalStudentId,
    account,
  } = {}) {
    this.nationalApprenticeId = nationalApprenticeId;
    this.nationalStudentId = nationalStudentId;
    this.account = account;
  }
}

module.exports = Student;
