const AirtableModel = require('./airtable-model');

class Solution extends AirtableModel {

  initialize() {

    super.initialize();

    if (this.record.fields) {

      const fields = this.record.fields;
      this.type = fields['Type d\'épreuve'];
      this.value = fields['Bonnes réponses'];

    }
  }

}

module.exports = Solution;
