const HigherSchoolingRegistration = require('./HigherSchoolingRegistration');
const { checkValidation } = require('../validators/higher-schooling-registration-set-validator');
const { areTwoStringsCloseEnough } = require('../services/string-comparison-service');

const RATIO = 0.25;

const STUDY_SCHEMES = [
  'csv-import-values.higher-schooling-registrations.study-schemes.initial-training',
  'csv-import-values.higher-schooling-registrations.study-schemes.training',
  'csv-import-values.higher-schooling-registrations.study-schemes.continuous-training',
  'csv-import-values.higher-schooling-registrations.study-schemes.other',
];

const DIPLOMAS = [
  'csv-import-values.higher-schooling-registrations.diplomas.license',
  'csv-import-values.higher-schooling-registrations.diplomas.master',
  'csv-import-values.higher-schooling-registrations.diplomas.doctorat',
  'csv-import-values.higher-schooling-registrations.diplomas.dnmade',
  'csv-import-values.higher-schooling-registrations.diplomas.dma ',
  'csv-import-values.higher-schooling-registrations.diplomas.bts',
  'csv-import-values.higher-schooling-registrations.diplomas.dut',
  'csv-import-values.higher-schooling-registrations.diplomas.dts',
  'csv-import-values.higher-schooling-registrations.diplomas.dcg ',
  'csv-import-values.higher-schooling-registrations.diplomas.deust',
  'csv-import-values.higher-schooling-registrations.diplomas.etat-controle',
  'csv-import-values.higher-schooling-registrations.diplomas.ingenieur',
  'csv-import-values.higher-schooling-registrations.diplomas.license-grade',
  'csv-import-values.higher-schooling-registrations.diplomas.master-grade',
  'csv-import-values.higher-schooling-registrations.diplomas.vise',
  'csv-import-values.higher-schooling-registrations.diplomas.classe-preparatoire',
  'csv-import-values.higher-schooling-registrations.diplomas.other',
];

const UNKNOWN = 'csv-import-values.higher-schooling-registrations.unknown';

class HigherSchoolingRegistrationSet {

  constructor(i18n) {
    this.i18n = i18n;
    this.registrations = [];
    this.warnings = [];
  }

  addRegistration(registrationAttributes) {
    const registration = new HigherSchoolingRegistration(registrationAttributes);
    this._checkStudyScheme(registration);
    this._checkDiploma(registration);
    this.registrations.push(registration);

    checkValidation(this);
  }

  addWarning(studentNumber, field, value, code) {
    this.warnings.push({ studentNumber, field, value, code });
  }

  _checkStudyScheme(registration) {
    const { studentNumber, studyScheme } = registration;
    if (this._isValidI18nValue(STUDY_SCHEMES, studyScheme)) return;
    this.addWarning(studentNumber, 'study-scheme', registration.studyScheme, 'unknown');
    registration.studyScheme = this.i18n.__(UNKNOWN);
  }

  _checkDiploma(registration) {
    const { studentNumber, diploma } = registration;
    if (this._isValidI18nValue(DIPLOMAS, diploma)) return;
    this.addWarning(studentNumber, 'diploma', registration.diploma, 'unknown');
    registration.diploma = this.i18n.__(UNKNOWN);
  }

  _isValidI18nValue(keys, valueToCheck) {
    if (!valueToCheck) return false;
    return keys.some((key) => {
      const reference = this.i18n.__(key).toLowerCase();
      const input = valueToCheck.toLowerCase();
      return areTwoStringsCloseEnough(input, reference, RATIO);
    });
  }
}

module.exports = HigherSchoolingRegistrationSet;
