import { CsvColumn } from '../../../../../../lib/infrastructure/serializers/csv/csv-column.js';

class CampaignIdsCsvHeader {
  constructor() {
    this.columns = this.setColumns();
  }

  setColumns() {
    return [
      new CsvColumn({
        property: 'campaignId',
        name: 'campaignId',
        isRequired: true,
      }),
    ];
  }
}

export { CampaignIdsCsvHeader };
