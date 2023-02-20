import { expect } from 'chai';
import getResultsCertifications from '../../../scripts/certification/get-results-certifications';

describe('Unit | Scripts | get-results-certifications.js', function () {
  const HEADERS = [
    'ID de certification',
    'Prenom du candidat',
    'Nom du candidat',
    'Date de naissance du candidat',
    'Lieu de naissance du candidat',
    'Identifiant Externe',
    'Statut de la certification',
    'ID de session',
    'Date de debut',
    'Date de fin',
    'Commentaire pour le candidat',
    "Commentaire pour l'organisation",
    'Commentaire pour le jury',
    'Note Pix',
    '1.1',
    '1.2',
    '1.3',
    '2.1',
    '2.2',
    '2.3',
    '2.4',
    '3.1',
    '3.2',
    '3.3',
    '3.4',
    '4.1',
    '4.2',
    '4.3',
    '5.1',
    '5.2',
  ];

  describe('buildCertificationRequest', function () {
    it('should take an id and return a request object', function () {
      // given
      const courseId = 12;
      const baseUrl = 'http://localhost:3000';
      const authToken = 'jwt.tokken';
      // when
      const result = getResultsCertifications.buildCertificationRequest(baseUrl, authToken, courseId);
      // then
      expect(result).to.have.property('json', true);
      expect(result).to.have.property('url', '/api/admin/certifications/12');
      expect(result.headers).to.have.property('authorization', 'Bearer jwt.tokken');
    });
  });

  describe('buildSessionRequest', function () {
    it('should take an id and return a request object', function () {
      // given
      const sessionId = 12;
      const baseUrl = 'http://localhost:3000';
      const authToken = 'jwt.tokken';
      // when
      const result = getResultsCertifications.buildSessionRequest(baseUrl, authToken, sessionId);
      // then
      expect(result).to.have.property('json', true);
      expect(result).to.have.property('url', '/api/sessions/12');
      expect(result.headers).to.have.property('authorization', 'Bearer jwt.tokken');
    });
  });

  describe('toCSVRow', function () {
    it('should normalize a JSON object', function () {
      // given
      const object = { data: { attributes: { 'competences-with-mark': [] } } };
      // when
      const result = getResultsCertifications.toCSVRow(object);
      // then
      expect(result).to.have.all.keys(HEADERS);
    });

    it('should extract all the informations of the certification', function () {
      // given
      const object = {
        data: {
          attributes: {
            'certification-id': '1337',
            'pix-score': 7331,
            'created-at': new Date('2018-01-31T09:01:00Z'),
            'completed-at': new Date('2018-01-31T09:29:16Z'),
            'competences-with-mark': [],
            status: 'validated',
            'comment-for-candidate': 'GG',
            'comment-for-organization': 'Too bad',
            'comment-for-jury': 'You get it',
            'first-name': 'Goku',
            'last-name': 'Son',
            birthdate: '1737-11-20',
            birthplace: 'Namek',
            'session-id': 1,
            'external-id': 'Kakarot',
          },
        },
      };
      // when
      const result = getResultsCertifications.toCSVRow(object);
      // then
      expect(result[HEADERS[0]]).to.equal('1337');
      expect(result[HEADERS[1]]).to.equal('Goku');
      expect(result[HEADERS[2]]).to.equal('Son');
      expect(result[HEADERS[3]]).to.equal('20/11/1737');
      expect(result[HEADERS[4]]).to.equal('Namek');
      expect(result[HEADERS[5]]).to.equal('Kakarot');
      expect(result[HEADERS[6]]).to.equal('validated');
      expect(result[HEADERS[7]]).to.equal(1);
      expect(result[HEADERS[8]]).to.equal('31/01/2018 10:01:00');
      expect(result[HEADERS[9]]).to.equal('31/01/2018 10:29:16');
      expect(result[HEADERS[10]]).to.equal('GG');
      expect(result[HEADERS[11]]).to.equal('Too bad');
      expect(result[HEADERS[12]]).to.equal('You get it');
      expect(result[HEADERS[13]]).to.equal(7331);
    });

    it('should extract competences', function () {
      // given
      const object = { data: { attributes: { 'competences-with-mark': [] } } };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result[HEADERS[14]]).to.equal('');
    });

    it('should extract competences 1.1', function () {
      // given
      const object = {
        data: {
          attributes: {
            'competences-with-mark': [
              {
                competence_code: '1.1',
                level: 9001,
              },
            ],
          },
        },
      };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result['1.1']).to.equal(9001);
    });

    it('should extract all competences', function () {
      // given
      const object = {
        data: {
          attributes: {
            'competences-with-mark': [
              {
                competence_code: '1.1',
                level: 4,
              },
              {
                competence_code: '1.2',
                level: 6,
              },
            ],
          },
        },
      };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result['1.1']).to.equal(4);
      expect(result['1.2']).to.equal(6);
    });
  });

  describe('findCompetence', function () {
    it('should return empty string when not found', function () {
      // given
      const profile = [];
      const competenceCode = '1.1';

      // when
      const result = getResultsCertifications.findCompetence(profile, competenceCode);

      // then
      expect(result).to.be.equals('');
    });

    it('should return competence level when found', function () {
      // given
      const competenceCode = '1.1';
      const profile = [
        {
          competence_code: competenceCode,
          level: 9,
        },
      ];

      // when
      const result = getResultsCertifications.findCompetence(profile, competenceCode);

      // then
      expect(result).to.be.equal(9);
    });
  });
});
