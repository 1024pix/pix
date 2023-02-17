const { CsvColumn } = require('./csv-column');

class SupOrganizationLearnerImportHeader {
  constructor(i18n) {
    this.translate = i18n.__;
    this.columns = this.setColumns();
  }

  setColumns() {
    return [
      new CsvColumn({
        property: 'firstName',
        name: this.translate('csv-template.sup-organization-learners.first-name'),
        isRequired: true,
        checkEncoding: true,
      }),
      new CsvColumn({
        property: 'middleName',
        name: this.translate('csv-template.sup-organization-learners.middle-name'),
      }),
      new CsvColumn({
        property: 'thirdName',
        name: this.translate('csv-template.sup-organization-learners.third-name'),
      }),
      new CsvColumn({
        property: 'lastName',
        name: this.translate('csv-template.sup-organization-learners.last-name'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'preferredLastName',
        name: this.translate('csv-template.sup-organization-learners.preferred-lastname'),
      }),
      new CsvColumn({
        property: 'birthdate',
        name: this.translate('csv-template.sup-organization-learners.birthdate'),
        isRequired: true,
        isDate: true,
      }),
      new CsvColumn({ property: 'email', name: this.translate('csv-template.sup-organization-learners.email') }),
      new CsvColumn({
        property: 'studentNumber',
        name: this.translate('csv-template.sup-organization-learners.student-number'),
        isRequired: true,
        checkEncoding: true,
      }),
      new CsvColumn({
        property: 'department',
        name: this.translate('csv-template.sup-organization-learners.department'),
      }),
      new CsvColumn({
        property: 'educationalTeam',
        name: this.translate('csv-template.sup-organization-learners.educational-team'),
      }),
      new CsvColumn({ property: 'group', name: this.translate('csv-template.sup-organization-learners.group') }),
      new CsvColumn({ property: 'diploma', name: this.translate('csv-template.sup-organization-learners.diploma') }),
      new CsvColumn({
        property: 'studyScheme',
        name: this.translate('csv-template.sup-organization-learners.study-scheme'),
      }),
    ];
  }
}

module.exports = SupOrganizationLearnerImportHeader;
