const { CsvColumn } = require('./csv-registration-parser');

class SchoolingRegistrationColumns {
  constructor(i18n) {
    this.translate = i18n.__;
    this.columns = this.setColumns();
  }

  setColumns() {
    return [
      new CsvColumn({ name: 'nationalIdentifier', label: this.translate('csv-template.schooling-registrations.national-identifier'), isRequired: true }),
      new CsvColumn({ name: 'firstName', label: this.translate('csv-template.schooling-registrations.first-name'), isRequired: true, checkEncoding: true }),
      new CsvColumn({ name: 'middleName', label: this.translate('csv-template.schooling-registrations.middle-name') }),
      new CsvColumn({ name: 'thirdName', label: this.translate('csv-template.schooling-registrations.third-name') }),
      new CsvColumn({ name: 'lastName', label: this.translate('csv-template.schooling-registrations.last-name'), isRequired: true }),
      new CsvColumn({ name: 'preferredLastName', label: this.translate('csv-template.schooling-registrations.preferred-last-name') }),
      new CsvColumn({ name: 'birthdate', label: this.translate('csv-template.schooling-registrations.birthdate'), isRequired: true, isDate: true }),
      new CsvColumn({ name: 'birthCityCode', label: this.translate('csv-template.schooling-registrations.birth-city-code') }),
      new CsvColumn({ name: 'birthCity', label: this.translate('csv-template.schooling-registrations.birth-city') }),
      new CsvColumn({ name: 'birthProvinceCode', label: this.translate('csv-template.schooling-registrations.birth-province-code'), isRequired: true }),
      new CsvColumn({ name: 'birthCountryCode', label: this.translate('csv-template.schooling-registrations.birth-country-code'), isRequired: true }),
      new CsvColumn({ name: 'status', label: this.translate('csv-template.schooling-registrations.status'), isRequired: true }),
      new CsvColumn({ name: 'MEFCode', label: this.translate('csv-template.schooling-registrations.mef-code'), isRequired: true }),
      new CsvColumn({ name: 'division', label: this.translate('csv-template.schooling-registrations.division'), isRequired: true }),
    ];
  }
}

module.exports = SchoolingRegistrationColumns;
