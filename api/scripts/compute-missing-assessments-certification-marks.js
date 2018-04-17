#! /usr/bin/env node
/* eslint no-console: ["off"] */

/* THIS SCRIPT WILL BE USED ONCE AND DELETED THEN AFTER */

const fs = require('fs');
const request = require('request-promise-native');
const papa = require('papaparse');

function _convertCSVDataToAssessments(csvParsingResult) {
  const dataRows = csvParsingResult.data;
  return dataRows.reduce((assessments, dataRow) => {
    const assessment = {
      assessmentId: parseInt(dataRow[0]),
      assessmentResultId: parseInt(dataRow[1])
    };
    assessments.push(assessment);
    return assessments;
  }, []);
}

function _buildMarksComputingRequestObject(baseUrl, accessToken, assessmentId, assessmentResultId) {
  return {
    headers: { authorization: `Bearer ${accessToken}` },
    method: 'POST',
    baseUrl,
    url: `/api/assessments/${assessmentId}/${assessmentResultId}`,
    json: true
  };
}

function _launchMarksComputing(assessment, baseUrl, accessToken) {
  const { assessmentId, assessmentResultId } = assessment;

  const requestConfig = _buildMarksComputingRequestObject(baseUrl, accessToken, assessmentId, assessmentResultId);
  return request(requestConfig).catch((err) => _logError(err, assessmentId, assessmentResultId));
}

function _logError(error, assessmentId, assessmentResultId) {
  console.log(`  > One error happened for assessmentId : ${assessmentId} - assessmentResultId : ${assessmentResultId} - erreur : ${error.message}`);
}

function processAssessments(baseUrl, accessToken, assessmentsWithNoMarks) {

  function _launchBatchProcessing(remainingElementsToUpdate, countOfBatches, batchesDone) {
    if (remainingElementsToUpdate.length <= 0) {
      return Promise.resolve()
        .then(() => {
          console.log(`\n-- ENDING - ${numberOfTotalBatches} iterations done\n`);
        });
    }

    const assessmentsToTreat = remainingElementsToUpdate.splice(0, 10);
    const promises = assessmentsToTreat.map((assessment) => _launchMarksComputing(assessment, baseUrl, accessToken));

    return Promise
      .all(promises)
      .then((results) => {
        console.log(`---- Lot ${batchesDone + 1} : ${results.length} processed - ${(batchesDone + 1) / countOfBatches * 100}%`);
      })
      .then(() => _launchBatchProcessing(remainingElementsToUpdate, countOfBatches, batchesDone+1));
  }

  const nbOfEntries = assessmentsWithNoMarks.length;
  const numberOfTotalBatches = Math.ceil(assessmentsWithNoMarks.length / 10);

  return Promise
    .resolve()
    .then(() => {
      console.log(`\n-- STARTING -- !!! ${nbOfEntries} entries to process !!!`);
      console.log(`Processing the data through ${numberOfTotalBatches} iterations\n`);
    })
    .then(() => _launchBatchProcessing(assessmentsWithNoMarks, numberOfTotalBatches, 0));
}

/**
 * Usage: node compute-missing-assessments-certification-marks.js http://localhost:3000 assessments.csv ze989Ddad98d45d3dd
 *
 * Request to launch in order to retrieve the assessmentIds and assessmentResultIds :
 *
 * SELECT assessments.id AS "assessmentId", "assessment-results".id AS "assessmentResultId"
 * FROM assessments LEFT JOIN "assessment-results" on assessments.id = "assessment-results"."assessmentId"
 * WHERE type = 'CERTIFICATION' AND assessments.id IN (
 * SELECT "assessmentId" FROM "assessment-results" WHERE id NOT IN (
 * SELECT DISTINCT "assessmentResultId" FROM "competence-marks"));
 *
 */
function main() {
  const baseUrl = process.argv[2];
  const filePath = process.argv[3];
  const accessToken = process.argv[4];

  try {
    console.log('-- Reading the csv file')
    const dataStream = fs.createReadStream(filePath);

    papa.parse(dataStream, {
      complete: (csvParsingResult) => {
        const assessments = _convertCSVDataToAssessments(csvParsingResult);

        processAssessments(baseUrl, accessToken, assessments)
          .then(() => {
            console.log('\nFin du script');
          });
      }
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
