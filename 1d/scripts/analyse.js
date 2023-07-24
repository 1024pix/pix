const fs = require('fs');
const { parse } = require('csv-parse');

const paths = {};

const printAssessment = function () {
  const outputTable = [];

  Object.entries(paths).forEach((path) => {
    let line = `${path[0]};`;

    path[1].forEach((p) => {
      line += `${p.level} | ${p.statut};`;
    });
    outputTable.push(line);
  });

  console.log(outputTable.join('\n'));
};

const groupStepByAssessment = (row) => {
  const stepData = extractStepData(row);
  addStepToAssessment(stepData, paths);
};

const extractStepData = (row) => {
  return {
    assessmentId: row[1],
    number: 0,
    statut: row[4],
    level: row[2],
    createdAt: row[3],
  };
};

const addStepToAssessment = (stepData, paths) => {
  if (paths[stepData.assessmentId]) {
    // hypothèse : les lignes sont déjà trié par createdAt d'answer
    stepData.number = paths[stepData.assessmentId].length;
  } else {
    paths[stepData.assessmentId] = new Array();
  }
  paths[stepData.assessmentId].push(stepData);
};

const fileName = process.argv[2];

if (!fileName) {
  console.log(' Usage : nodejs 1d/scripts/analyse.js [data-file.csv] ');
  process.exit(1);
}

fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ',', from_line: 2 }))
  .on('data', groupStepByAssessment)
  .on('end', printAssessment);
