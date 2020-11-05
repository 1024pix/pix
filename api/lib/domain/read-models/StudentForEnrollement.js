class StudentForEnrollement {
  constructor(
    {
      id,
      firstName,
      lastName,
      birthdate,
      division,
      isEnrolled,
    } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.division = division;
    this.isEnrolled = isEnrolled;
  }
}

module.exports = StudentForEnrollement;
