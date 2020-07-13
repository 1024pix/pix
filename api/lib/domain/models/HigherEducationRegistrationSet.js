const HigherEducationRegistration =  require('./HigherEducationRegistration');
const { checkValidation } = require('../validators/higher-education-registration-set-validator');
class HigherEducationRegistrationSet {

  constructor() {
    this.registrations = [];
  }

  addRegistration(registrationAttributes) {
    const registration = new HigherEducationRegistration(registrationAttributes);
    this.registrations.push(registration);
    checkValidation(this);
  }
}

module.exports = HigherEducationRegistrationSet;
