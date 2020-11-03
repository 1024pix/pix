class Student {

  constructor({
    nationalStudentId,
    account,
  } = {}) {
    this.nationalStudentId = nationalStudentId;
    this.account = account;
  }
}

module.exports = Student;
