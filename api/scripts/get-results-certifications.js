#! /usr/bin/env node

const request = require('request-promise-native');
const json2csv = require('json2csv');
// request.debug = true;
const DESTFILE = '/tmp/certificationResults.csv';
const HEADERS = [
  'Numero certification', 'Date', 'Note Pix',
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2',
];

function parseArgs(argv) {
  const [_a, _b, ...args] = argv;
  return args;
}

function buildRequestObject(certificationId) {
  return {
    baseUrl: 'https://pix.beta.gouv.fr',
    url: `/api/certification-courses/${certificationId}/result`,
    json: true,
    transform: (body) => {
      body.certificationId = certificationId;
      return body;
    }
  };
}

function makeRequest(config) {
  return request(config);
}

function findCompetence(profile, competenceName) {
  const result = profile.find(competence => competence.index === competenceName);
  return (result || { level: '' }).level;
}

function toCSVRow(rowJSON) {
  const res = {};
  const [idColumn, dateColumn, noteColumn, ...competencesColumns] = HEADERS;
  res[idColumn] = rowJSON.certificationId;
  res[dateColumn] = rowJSON.createdAt;
  res[noteColumn] = rowJSON.totalScore;
  competencesColumns.forEach(column => {
    res[column] = findCompetence(rowJSON.listCertifiedCompetences, column);
  });
  return res;
}

function writeToFile(filename, fileContent) {
  const fs = require('fs');
  fs.writeFileSync(filename, fileContent);
  return fileContent;
}

function syncInstruction() {
  const os = require('os');
  const hostname = os.hostname();

  const helpText = `Deconnectez vous puis téléchargez le fichier avec :\n\t rsync --progress --remove-source-files deploy@${hostname}:${DESTFILE} .`;
  console.log(helpText);
}

function main() {
  const ids = parseArgs(process.argv);
  const requests = Promise.all(
    ids.map(id => buildRequestObject(id))
      .map(requestObject => makeRequest(requestObject))
  );

  requests.then(certificationResults => certificationResults.map(toCSVRow))
    .then(res => json2csv({
      data: res,
      fieldNames: HEADERS,
      del: ';',
    }))
    .then(csv => { console.log(`\n\n${csv}\n\n`); return csv; })
    .then(csv => writeToFile(DESTFILE, csv))
    .then(() => syncInstruction());
}

/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  main();
} else {
  const { describe, it } = require('mocha');
  const { expect } = require('chai');
  describe('Get Result Certifications Script', () => {
    describe('parseArgs', () => {
      it('should return an array', () => {
        // given
        const args = ['/usr/bin/node', '/path/to/script.js', '1', '2', '3'];
        // when
        const result = parseArgs(args);
        // then
        expect(result).to.be.an('array');
        expect(result).to.deep.equals(['1', '2', '3']);
      });
    });

    describe('buildRequestObject', () => {

      it('should take an id and return a request object', () => {
        // given
        const courseId = 12;
        // when
        const result = buildRequestObject(courseId);
        // then
        expect(result).to.have.property('json', true);
        expect(result).to.have.property('url','/api/certification-courses/12/result');
      });

      it('should add certificationId to API response when the object is transform after the request', () => {
        // given
        const requestObject = buildRequestObject(12);
        // when
        const result = requestObject.transform({});
        // then
        expect(result).to.have.property('certificationId', 12);
      });
    });

    describe('toCSVRow', () => {
      it('should normalize a JSON object', () => {
        // given
        const object = { listCertifiedCompetences: [] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result).to.have.all.keys(HEADERS);
      });

      it('should extract certificationId, date, and pix score', () => {
        // given
        const object = { certificationId: '1337', totalScore: 7331, createdAt: '2017-05-10', listCertifiedCompetences: [] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result[HEADERS[0]]).to.equals('1337');
        expect(result[HEADERS[1]]).to.equals('2017-05-10');
        expect(result[HEADERS[2]]).to.equals(7331);
      });

      it('should extract competences', () => {
        // given
        const object = { listCertifiedCompetences : [] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result[HEADERS[3]]).to.equals('');
      });

      it('should extract competences 1.1', () => {
        // given
        const object = { listCertifiedCompetences: [
          {
            name: 'Sécuriser l\'environnement numérique',
            index: '1.1',
            id: 'rec',
            level: 9001
          }
        ] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result['1.1']).to.equals(9001);
      });

      it('should extract all competences', () => {
        // given
        const object = { listCertifiedCompetences: [
          {
            name: 'Mener une recherche',
            index: '1.1',
            id: 'rec',
            level: 4
          },
          {
            name: 'Sécuriser l\'environnement numérique',
            index: '1.2',
            id: 'rec',
            level: 6
          }
        ] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result['1.1']).to.equals(4);
        expect(result['1.2']).to.equals(6);
      });

    });

    describe('findCompetence', () => {
      it('should return empty string when not found', () => {
        // given
        const profile = [];
        const competenceName = '1.1';
        // when
        const result = findCompetence(profile, competenceName);
        // then
        expect(result).to.be.equals('');
      });

      it('should return competence level when found', () => {
        // given
        const profile = [{
          name: 'Sécuriser l\'environnement numérique',
          index: '1.1',
          id: 'rec',
          level: 9
        }];
        const competenceName = '1.1';
        // when
        const result = findCompetence(profile, competenceName);
        // then
        expect(result).to.be.equals(9);
      });
    });
  });
}
