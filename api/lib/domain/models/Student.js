class Student {

  constructor({
    id,
    // attributes
    lastName,
    firstName,
    birthdate,
    // includes
    organization,
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.lastName = lastName,
    this.firstName = firstName,
    this.birthdate = birthdate,
    // includes
    this.organization = organization;
    // references
  }
}

module.exports = Student;
