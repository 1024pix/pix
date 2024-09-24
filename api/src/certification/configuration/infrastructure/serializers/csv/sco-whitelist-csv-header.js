import { CsvColumn } from '../../../../../../lib/infrastructure/serializers/csv/csv-column.js';

class ScoWhitelistCsvHeader {
  constructor() {
    this.columns = this.setColumns();
  }

  setColumns() {
    return [
      new CsvColumn({
        property: 'externalId',
        name: 'externalId',
        isRequired: true,
      }),
    ];
  }
}

export { ScoWhitelistCsvHeader };
