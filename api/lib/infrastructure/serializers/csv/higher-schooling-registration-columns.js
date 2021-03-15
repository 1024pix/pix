const { CsvColumn } = require('./csv-registration-parser');

class HigherSchoolingRegistrationColumns {
  constructor(i18n) {
    this.translate = i18n.__;
    this.columns = this.setColumns();
  }

  setColumns() {
    return [
      new CsvColumn({ name: 'firstName', label: this.translate('higher-schooling-registration-csv.firstname'), isRequired: true, checkEncoding: true }),
      new CsvColumn({ name: 'middleName', label: this.translate('higher-schooling-registration-csv.middle-name') }),
      new CsvColumn({ name: 'thirdName', label: this.translate('higher-schooling-registration-csv.third-name') }),
      new CsvColumn({ name: 'lastName', label: this.translate('higher-schooling-registration-csv.lastname'), isRequired: true }),
      new CsvColumn({ name: 'preferredLastName', label: this.translate('higher-schooling-registration-csv.preferred-lastname') }),
      new CsvColumn({ name: 'birthdate', label: this.translate('higher-schooling-registration-csv.birthdate'), isRequired: true, isDate: true }),
      new CsvColumn({ name: 'email', label: this.translate('higher-schooling-registration-csv.email') }),
      new CsvColumn({ name: 'studentNumber', label: this.translate('higher-schooling-registration-csv.student-number'), isRequired: true, checkEncoding: true }),
      new CsvColumn({ name: 'department', label: this.translate('higher-schooling-registration-csv.department') }),
      new CsvColumn({ name: 'educationalTeam', label: this.translate('higher-schooling-registration-csv.educational-team') }),
      new CsvColumn({ name: 'group', label: this.translate('higher-schooling-registration-csv.group') }),
      new CsvColumn({ name: 'diploma', label: this.translate('higher-schooling-registration-csv.diploma') }),
      new CsvColumn({ name: 'studyScheme', label: this.translate('higher-schooling-registration-csv.study-scheme') }),
    ];
  }
}

module.exports = HigherSchoolingRegistrationColumns;
