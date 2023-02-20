const { CsvColumn } = require('./csv-column');

class OrganizationLearnerImportHeader {
  constructor(i18n) {
    this.translate = i18n.__;
    this.columns = this.setColumns();
  }

  setColumns() {
    return [
      new CsvColumn({
        property: 'nationalIdentifier',
        name: this.translate('csv-template.organization-learners.national-identifier'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'firstName',
        name: this.translate('csv-template.organization-learners.first-name'),
        isRequired: true,
        checkEncoding: true,
      }),
      new CsvColumn({ property: 'middleName', name: this.translate('csv-template.organization-learners.middle-name') }),
      new CsvColumn({ property: 'thirdName', name: this.translate('csv-template.organization-learners.third-name') }),
      new CsvColumn({
        property: 'lastName',
        name: this.translate('csv-template.organization-learners.last-name'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'preferredLastName',
        name: this.translate('csv-template.organization-learners.preferred-last-name'),
      }),
      new CsvColumn({
        property: 'sex',
        name: this.translate('csv-template.organization-learners.sex'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'birthdate',
        name: this.translate('csv-template.organization-learners.birthdate'),
        isRequired: true,
        isDate: true,
      }),
      new CsvColumn({
        property: 'birthCityCode',
        name: this.translate('csv-template.organization-learners.birth-city-code'),
      }),
      new CsvColumn({ property: 'birthCity', name: this.translate('csv-template.organization-learners.birth-city') }),
      new CsvColumn({
        property: 'birthProvinceCode',
        name: this.translate('csv-template.organization-learners.birth-province-code'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'birthCountryCode',
        name: this.translate('csv-template.organization-learners.birth-country-code'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'status',
        name: this.translate('csv-template.organization-learners.status'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'MEFCode',
        name: this.translate('csv-template.organization-learners.mef-code'),
        isRequired: true,
      }),
      new CsvColumn({
        property: 'division',
        name: this.translate('csv-template.organization-learners.division'),
        isRequired: true,
      }),
    ];
  }
}

module.exports = OrganizationLearnerImportHeader;
