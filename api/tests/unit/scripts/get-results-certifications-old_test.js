const { expect } = require('chai');

const { parseArgs, toCSVRow, buildRequestObject, findCompetence, HEADERS } = require('$root/scripts/get-results-certifications-old');

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
      const authToken = 'jwt.tokken';

      // when
      const result = buildRequestObject(baseUrl, authToken, courseId);
      // then
      expect(result).to.have.property('json', true);
      expect(result).to.have.property('url', '/api/admin/certifications/12/details');
      expect(result.headers).to.have.property('authorization', 'Bearer jwt.tokken');
    });

    it('should add certificationId to API response when the object is transform after the request', () => {
      // given
      const baseUrl = 'http://localhost:3000';
      const requestObject = buildRequestObject(baseUrl, '', 12);
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
      const object = {
        certificationId: '1337',
        totalScore: 7331,
        createdAt: new Date('2018-01-31T09:01:00Z'),
        completedAt: new Date('2018-01-31T09:29:16Z'),
        competencesWithMark: []
      };
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
      const object = { competencesWithMark: [] };
      // when
      const result = toCSVRow(object);
      // then
      expect(result[HEADERS[4]]).to.equals('');
    });

    it('should extract competences 1.1', () => {
      // given
      const object = {
        competencesWithMark: [
          {
            name: 'Sécuriser l\'environnement numérique',
            index: '1.1',
            id: 'rec',
            obtainedLevel: 9001
          }
        ]
      };
      // when
      const result = toCSVRow(object);
      // then
      expect(result['1.1']).to.equals(9001);
    });

    it('should extract all competences', () => {
      // given
      const object = {
        competencesWithMark: [
          {
            name: 'Mener une recherche',
            index: '1.1',
            id: 'rec',
            obtainedLevel: 4
          },
          {
            name: 'Sécuriser l\'environnement numérique',
            index: '1.2',
            id: 'rec',
            obtainedLevel: 6
          }
        ]
      };
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

    it('should return competence obtainedLevel when found', () => {
      // given
      const profile = [{
        name: 'Sécuriser l\'environnement numérique',
        index: '1.1',
        id: 'rec',
        obtainedLevel: 9
      }];
      const competenceName = '1.1';
      // when
      const result = findCompetence(profile, competenceName);
      // then
      expect(result).to.be.equals(9);
    });
  });
});
