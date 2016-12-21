const AirtableModel = require('./airtable-model');
const _ = require('../../../utils/lodash-utils');

class Solution extends AirtableModel {

  initialize() {

    super.initialize();

    if (this.record.fields) {

      const fields = this.record.fields;
      this.type = fields['Type d\'épreuve'];
      this.value = fields['Bonnes réponses'];
      this.scoring = _.ensureString(fields['Scoring']).replace(/@/g, ''); // XXX YAML ne supporte pas @

    }
  }

}

module.exports = Solution;
