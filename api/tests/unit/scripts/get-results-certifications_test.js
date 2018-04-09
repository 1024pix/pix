
const { expect } = require('chai');
const getResultsCertifications = require('../../../../api/scripts/get-results-certifications');

describe('Unit | Scripts | get-results-certifications.js', () => {

  const HEADERS = [
    'Numero certification', 'Numero de session', 'Date de début', 'Date de fin',
    'Status de la session', 'Note Pix',
    'Prénom', 'Nom', 'Date de naissance', 'Lieu de naissance',
    'Commentaire pour le candidat', 'Commentaire pour l\'organisation', 'Commentaire du jury',
    '1.1', '1.2', '1.3',
    '2.1', '2.2', '2.3', '2.4',
    '3.1', '3.2', '3.3', '3.4',
    '4.1', '4.2', '4.3',
    '5.1', '5.2'
  ];

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

    it('should extract all the informations of the certification', () => {
      // given
      const object = {
        data: {
          attributes: {
            'certification-id': '1337',
            'pix-score': 7331,
            'created-at': '2018-01-31 09:01',
            'completed-at': '2018-01-31T09:29:16.394Z',
            'competences-with-mark': [],
            'status': 'validated',
            'comment-for-candidate': 'GG',
            'comment-for-organization': 'Too bad',
            'comment-for-jury': 'You get it',
            'first-name': 'Goku',
            'last-name': 'Son',
            'birthdate': '20/11/737',
            'birthplace': 'Vegeta',
            'session-id': 1
          }
        }
      };
      // when
      const result = getResultsCertifications.toCSVRow(object);
      // then
      expect(result[HEADERS[0]]).to.equal('1337');
      expect(result[HEADERS[1]]).to.equal(1);
      expect(result[HEADERS[2]]).to.equal('31/01/2018 10:01:00');
      expect(result[HEADERS[3]]).to.equal('31/01/2018 10:29:16');
      expect(result[HEADERS[4]]).to.equal('validated');
      expect(result[HEADERS[5]]).to.equal(7331);
      expect(result[HEADERS[6]]).to.equal('Goku');
      expect(result[HEADERS[7]]).to.equal('Son');
      expect(result[HEADERS[8]]).to.equal('20/11/737');
      expect(result[HEADERS[9]]).to.equal('Vegeta');
      expect(result[HEADERS[10]]).to.equal('GG');
      expect(result[HEADERS[11]]).to.equal('Too bad');
      expect(result[HEADERS[12]]).to.equal('You get it');
    });

    it('should extract competences', () => {
      // given
      const object = { data: { attributes: { 'competences-with-mark': [] } } };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result[HEADERS[13]]).to.equal('');
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
      expect(result['1.1']).to.equal(9001);
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
      expect(result['1.1']).to.equal(4);
      expect(result['1.2']).to.equal(6);
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
      expect(result).to.be.equal(9);
    });
  });
});
