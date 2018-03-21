
const { expect } = require('chai');
const getResultsCertifications = require('../../../../api/scripts/get-results-certifications');

describe('Unit | Script | GET results-certification', () => {

  const HEADERS = [
    'Numero certification', 'Date de début', 'Date de fin', 'Note Pix',
    '1.1', '1.2', '1.3',
    '2.1', '2.2', '2.3', '2.4',
    '3.1', '3.2', '3.3', '3.4',
    '4.1', '4.2', '4.3',
    '5.1', '5.2',
  ];

  describe('parseArgs', () => {
    it('should return an array', () => {
      // given
      const args = ['/usr/bin/node', '/path/to/script.js', 'http://localhost:3000', '1', '2', '3'];
      // when
      const result = getResultsCertifications.parseArgs(args);
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
      const result = getResultsCertifications.buildRequestObject(baseUrl, authToken, courseId);
      // then
      expect(result).to.have.property('json', true);
      expect(result).to.have.property('url', '/api/admin/certifications/12');
      expect(result.headers).to.have.property('authorization', 'Bearer jwt.tokken');
    });

    it('should add certificationId to API response when the object is transform after the request', () => {
      // given
      const baseUrl = 'http://localhost:3000';
      const requestObject = getResultsCertifications.buildRequestObject(baseUrl, '', 12);

      // when
      const result = requestObject.transform({ data: { attributes: {} } });

      // then
      expect(result.data.attributes).to.have.property('certificationId', 12);
    });
  });

  describe('toCSVRow', () => {
    it('should normalize a JSON object', () => {
      // given
      const object = { data: { attributes: { 'competences-with-mark': [] } } };
      // when
      const result = getResultsCertifications.toCSVRow(object);
      // then
      expect(result).to.have.all.keys(HEADERS);
    });

    it('should extract certificationId, date, and pix score', () => {
      // given
      const object = {
        data: {
          attributes: {
            certificationId: '1337',
            'pix-score': 7331,
            'created-at': '2018-01-31 09:01',
            'completed-at': '2018-01-31T09:29:16.394Z',
            'competences-with-mark': []
          }
        }
      };
      // when
      const result = getResultsCertifications.toCSVRow(object);
      // then
      expect(result[HEADERS[0]]).to.equals('1337');
      expect(result[HEADERS[1]]).to.equals('31/01/2018 10:01:00');
      expect(result[HEADERS[2]]).to.equals('31/01/2018 10:29:16');
      expect(result[HEADERS[3]]).to.equals(7331);
    });

    it('should extract competences', () => {
      // given
      const object = { data: { attributes: { 'competences-with-mark': [] } } };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result[HEADERS[4]]).to.equals('');
    });

    it('should extract competences 1.1', () => {
      // given
      const object = {
        data: {
          attributes: {
            'competences-with-mark': [
              {
                'competence-code': '1.1',
                level: 9001
              }
            ]
          }
        }
      };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result['1.1']).to.equals(9001);
    });

    it('should extract all competences', () => {
      // given
      const object = {
        data: {
          attributes: {
            'competences-with-mark': [
              {
                'competence-code': '1.1',
                level: 4
              },
              {
                'competence-code': '1.2',
                level: 6
              }
            ]
          }
        }
      };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result['1.1']).to.equals(4);
      expect(result['1.2']).to.equals(6);
    });

  });

  describe('findCompetence', () => {

    it('should return empty string when not found', () => {
      // given
      const profile = [];
      const competenceCode = '1.1';

      // when
      const result = getResultsCertifications.findCompetence(profile, competenceCode);

      // then
      expect(result).to.be.equals('');
    });

    it('should return competence level when found', () => {
      // given
      const competenceCode = '1.1';
      const profile = [{
        'competence-code': competenceCode,
        level: 9
      }];

      // when
      const result = getResultsCertifications.findCompetence(profile, competenceCode);

      // then
      expect(result).to.be.equals(9);
    });
  });
});
