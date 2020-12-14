const HigherSchoolingRegistration = require('./HigherSchoolingRegistration');
const { checkValidation } = require('../validators/higher-schooling-registration-set-validator');
class HigherSchoolingRegistrationSet {

  constructor() {
    this.registrations = [];
  }

  addRegistration(registrationAttributes) {
    const registration = new HigherSchoolingRegistration(registrationAttributes);
    this.registrations.push(registration);
    checkValidation(this);
  }
}

module.exports = HigherSchoolingRegistrationSet;
