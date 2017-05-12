const _ = require('../../utils/lodash-utils');
const Solution = require('../../../domain/models/referential/solution');
const AirtableSerializer = require('./airtable-serializer');

function isTreatmentDisable(fields, fieldName) {
  return (fields[fieldName]) && (fields[fieldName] === 'Désactivé');
}

function checkTreatmentIsEnableAndRemoveItIfNot(fields, fieldName, enabledTreatments, treatment) {
  if (isTreatmentDisable(fields, fieldName)) {
    _.pull(enabledTreatments, treatment);
  }
}

class SolutionSerializer extends AirtableSerializer {

  deserialize(airtableRecord) {

    const solution = new Solution();

    solution.id = airtableRecord.id;

    if (airtableRecord.fields) {

      const fields = airtableRecord.fields;

      solution.type = fields['Type d\'épreuve'];
      solution.value = fields['Bonnes réponses'];

      solution.enabledTreatments = ['t1', 't2', 't3'];
      checkTreatmentIsEnableAndRemoveItIfNot(fields, 'T1 - Espaces, casse & accents', solution.enabledTreatments, 't1');
      checkTreatmentIsEnableAndRemoveItIfNot(fields, 'T2 - Ponctuation', solution.enabledTreatments, 't2');
      checkTreatmentIsEnableAndRemoveItIfNot(fields, 'T3 - Distance d\'édition', solution.enabledTreatments, 't3');

      // TODO to be removed before code review
      solution.deactivations = {};
      solution.deactivations.t1 = fields['T1 - Espaces, casse & accents'] === 'Désactivé';
      solution.deactivations.t2 = fields['T2 - Ponctuation'] === 'Désactivé';
      solution.deactivations.t3 = fields['T3 - Distance d\'édition'] === 'Désactivé';

      solution.scoring = _.ensureString(fields['Scoring']).replace(/@/g, ''); // XXX YAML ne supporte pas @
    }

    return solution;
  }

}

module.exports = new SolutionSerializer();
