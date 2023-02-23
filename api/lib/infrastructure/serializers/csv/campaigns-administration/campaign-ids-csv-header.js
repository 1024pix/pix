const { CsvColumn } = require('../csv-column.js');

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

module.exports = CampaignIdsCsvHeader;
