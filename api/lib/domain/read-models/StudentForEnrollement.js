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

  static fromStudentsAndCertificationCandidates({ student, certificationCandidates }) {
    const isEnrolled = certificationCandidates.some((candidate) => candidate.schoolingRegistrationId === student.id);

    return new StudentForEnrollement({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      birthdate: student.birthdate,
      division: student.division,
      isEnrolled,
    });
  }

}

module.exports = StudentForEnrollement;
