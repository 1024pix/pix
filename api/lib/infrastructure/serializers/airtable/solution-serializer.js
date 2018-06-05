const _ = require('../../utils/lodash-utils');
const Solution = require('../../../domain/models/Solution');

function isTreatmentDisable(fields, fieldName) {
  return (fields[fieldName]) && (fields[fieldName] === 'Désactivé');
}

class SolutionSerializer {

  deserialize(airtableRecord) {

    const solution = new Solution({
      id: airtableRecord.id
    });

    if (airtableRecord.fields) {

      const fields = airtableRecord.fields;

      solution.type = fields['Type d\'épreuve'];
      solution.value = fields['Bonnes réponses'];

      solution.isT1Enabled = !isTreatmentDisable(fields, 'T1 - Espaces, casse & accents');
      solution.isT2Enabled = !isTreatmentDisable(fields, 'T2 - Ponctuation');
      solution.isT3Enabled = !isTreatmentDisable(fields, 'T3 - Distance d\'édition');

      solution.scoring = _.ensureString(fields['Scoring']).replace(/@/g, ''); // XXX YAML ne supporte pas @
    }

    return solution;
  }
}

module.exports = new SolutionSerializer();
