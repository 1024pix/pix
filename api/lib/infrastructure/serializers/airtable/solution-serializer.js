const _ = require('../../utils/lodash-utils');
const Solution = require('../../../domain/models/referential/solution');

class SolutionSerializer {

  deserialize(airtableRecord) {

    const solution = new Solution();

    solution.id = airtableRecord.id;

    if (airtableRecord.fields) {

      const fields = airtableRecord.fields;

      solution.type = fields['Type d\'épreuve'];
      solution.value = fields['Bonnes réponses'];
      solution.deactivations = {};
      solution.deactivations.t1 = fields['désactiver T1'];
      solution.deactivations.t2 = fields['désactiver T2'];
      solution.deactivations.t3 = fields['désactiver T3'];
      solution.scoring = _.ensureString(fields['Scoring']).replace(/@/g, ''); // XXX YAML ne supporte pas @
    }

    return solution;
  }

}

module.exports = new SolutionSerializer();
