#! /usr/bin/env node
const request = require('request-promise-native');
const { batch } = require('../db/batchTreatment');

function compute(listOfAssessmentsToRecompute, request) {

  return batch(null, listOfAssessmentsToRecompute, (assessmentId) => {
    return request({
      method: 'POST',
      uri: 'https://api.pix.fr/api/assessment-results?recompute=true',
      body: {
        'data': {
          'relationships': {
            'assessment': {
              'data': {
                'type': 'assessments',
                'id': assessmentId,
              },
            },
          }, 'type': 'assessment-results',
        },
      },
      json: true,
    });
  });
}

/**
 * Le script déclenche une demande de calcule pour chaque assessmentId listé dans un fichier.
 * Le fichier doit contenir un seul assessmentId par ligne.
 *
 * Ex: ./recompute-assessment-results.js ./path/to/list/of/ids.txt
 */
function main() {
  const pathToListOfIds = process.argv[2];

  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(pathToListOfIds),
  });

  const listOfAssessmentIdsToRecompute = [];
  lineReader.on('line', (line) => {
    listOfAssessmentIdsToRecompute.push(line);
  });

  lineReader.on('close', () => {
    compute(listOfAssessmentIdsToRecompute, request);
  });

}

if (require.main === module) {
  main();
}

module.exports = { compute };
