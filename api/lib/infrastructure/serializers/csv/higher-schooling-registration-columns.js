const { CsvColumn } = require('./csv-registration-parser');

class HigherSchoolingRegistrationColumns {
  constructor(i18n) {
    this.translate = i18n.__;
    this.columns = this.setColumns();
  }

  setColumns() {
    return [
      new CsvColumn({ name: 'firstName', label: this.translate('csv-template.higher-schooling-registrations.first-name'), isRequired: true, checkEncoding: true }),
      new CsvColumn({ name: 'middleName', label: this.translate('csv-template.higher-schooling-registrations.middle-name') }),
      new CsvColumn({ name: 'thirdName', label: this.translate('csv-template.higher-schooling-registrations.third-name') }),
      new CsvColumn({ name: 'lastName', label: this.translate('csv-template.higher-schooling-registrations.last-name'), isRequired: true }),
      new CsvColumn({ name: 'preferredLastName', label: this.translate('csv-template.higher-schooling-registrations.preferred-lastname') }),
      new CsvColumn({ name: 'birthdate', label: this.translate('csv-template.higher-schooling-registrations.birthdate'), isRequired: true, isDate: true }),
      new CsvColumn({ name: 'email', label: this.translate('csv-template.higher-schooling-registrations.email') }),
      new CsvColumn({ name: 'studentNumber', label: this.translate('csv-template.higher-schooling-registrations.student-number'), isRequired: true, checkEncoding: true }),
      new CsvColumn({ name: 'department', label: this.translate('csv-template.higher-schooling-registrations.department') }),
      new CsvColumn({ name: 'educationalTeam', label: this.translate('csv-template.higher-schooling-registrations.educational-team') }),
      new CsvColumn({ name: 'group', label: this.translate('csv-template.higher-schooling-registrations.group') }),
      new CsvColumn({ name: 'diploma', label: this.translate('csv-template.higher-schooling-registrations.diploma') }),
      new CsvColumn({ name: 'studyScheme', label: this.translate('csv-template.higher-schooling-registrations.study-scheme') }),
    ];
  }
}

module.exports = HigherSchoolingRegistrationColumns;
