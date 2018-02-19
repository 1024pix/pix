#! /usr/bin/env node

const request = require('request-promise-native');
const json2csv = require('json2csv');
const moment = require('moment-timezone');

// request.debug = true;
const HEADERS = [
  'Numero certification', 'Date de début', 'Date de fin', 'Note Pix',
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2',
];

function parseArgs(argv) {
  const [_a, _b, _c, ...args] = argv;
  return args;
}

function buildRequestObject(baseUrl, certificationId) {
  return {
    baseUrl: baseUrl,
    url: `/api/certification-courses/${certificationId}/result/compute`,
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
  const [idColumn, dateStartColumn, dateEndColumn, noteColumn, ...competencesColumns] = HEADERS;
  res[idColumn] = rowJSON.certificationId;
  res[dateStartColumn] = moment.utc(rowJSON.createdAt).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  if (rowJSON.completedAt) {
    res[dateEndColumn] = moment(rowJSON.completedAt).tz('Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
  } else {
    res[dateEndColumn] = '';
  }

  res[noteColumn] = rowJSON.totalScore;
  competencesColumns.forEach(column => {
    res[column] = findCompetence(rowJSON.competencesWithMark, column);
  });
  return res;
}

function main() {
  const baseUrl = process.argv[2];
  const ids = parseArgs(process.argv);
  const requests = Promise.all(
    ids.map(id => buildRequestObject(baseUrl, id))
      .map(requestObject => makeRequest(requestObject))
  );

  requests.then(certificationResults => certificationResults.map(toCSVRow))
    .then(res => json2csv({
      data: res,
      fieldNames: HEADERS,
      del: ';',
    }))
    .then(csv => { console.log(`\n\n${csv}\n\n`); return csv; });
}

/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  main();
} else {
  const { describe, it } = require('mocha');
  const { expect } = require('chai');
  describe('Get Result Certifications Script OLD', () => {
    describe('parseArgs', () => {
      it('should return an array', () => {
        // given
        const args = ['/usr/bin/node', '/path/to/script.js', 'http://localhost:3000', '1', '2', '3'];
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
        const baseUrl = 'http://localhost:3000';
        // when
        const result = buildRequestObject(baseUrl, courseId);
        // then
        expect(result).to.have.property('json', true);
        expect(result).to.have.property('url','/api/certification-courses/12/result/compute');
      });

      it('should add certificationId to API response when the object is transform after the request', () => {
        // given
        const baseUrl = 'http://localhost:3000';
        const requestObject = buildRequestObject(baseUrl,12);
        // when
        const result = requestObject.transform({});
        // then
        expect(result).to.have.property('certificationId', 12);
      });
    });

    describe('toCSVRow', () => {
      it('should normalize a JSON object', () => {
        // given
        const object = { competencesWithMark: [] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result).to.have.all.keys(HEADERS);
      });

      it('should extract certificationId, date, and pix score', () => {
        // given
        const object = { certificationId: '1337', totalScore: 7331, createdAt: '2018-01-31 09:01', completedAt: '2018-01-31T09:29:16.394Z', competencesWithMark: [] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result[HEADERS[0]]).to.equals('1337');
        expect(result[HEADERS[1]]).to.equals('31/01/2018 10:01:00');
        expect(result[HEADERS[2]]).to.equals('31/01/2018 10:29:16');
        expect(result[HEADERS[3]]).to.equals(7331);
      });

      it('should extract competences', () => {
        // given
        const object = { competencesWithMark : [] };
        // when
        const result = toCSVRow(object);
        // then
        expect(result[HEADERS[4]]).to.equals('');
      });

      it('should extract competences 1.1', () => {
        // given
        const object = { competencesWithMark: [
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
        const object = { competencesWithMark: [
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
