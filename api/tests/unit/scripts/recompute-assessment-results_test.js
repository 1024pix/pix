const { sinon, expect } = require('../../test-helper');
const recomputeAssessments = require('../../../../api/scripts/recompute-assessment-results');

describe('Unit | Scripts | recompute-assessment-results', () => {

  describe('#recomputeScore', () => {

    it('should', () => {
      // given
      const listOfAssessmentsToRecompute = [123, 987];
      const request = sinon.stub().resolves();

      // when
      const promise = recomputeAssessments.compute(listOfAssessmentsToRecompute, request);

      // then
      return promise.then(() => {
        expect(request).to.have.been.calledTwice;

        expect(request.firstCall.args).to.deep.equal([{
          method: 'POST',
          uri: 'https://pix.fr/api/assessment-results?recompute=true',
          body: {
            'data': {
              'relationships': {
                'assessment': {
                  'data': {
                    'type': 'assessments',
                    'id': 123
                  }
                }
              }, 'type': 'assessment-results'
            }
          },
          json: true
        }]);

        expect(request.secondCall.args).to.deep.equal([{
          method: 'POST',
          uri: 'https://pix.fr/api/assessment-results?recompute=true',
          body: {
            'data': {
              'relationships': {
                'assessment': {
                  'data': {
                    'type': 'assessments',
                    'id': 987
                  }
                }
              }, 'type': 'assessment-results'
            }
          },
          json: true
        }]);

      });
    });
  });

/*
  describe('buildCertificationRequest', () => {

    it('should take an id and return a request object', () => {
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

  describe('buildSessionRequest', function() {

    it('should take an id and return a request object', () => {
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
            'birthdate': '1737-11-20',
            'birthplace': 'Namek',
            'session-id': 1,
            'external-id': 'Kakarot'
          }
        }
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

    it('should extract competences', () => {
      // given
      const object = { data: { attributes: { 'competences-with-mark': [] } } };

      // when
      const result = getResultsCertifications.toCSVRow(object);

      // then
      expect(result[HEADERS[14]]).to.equal('');
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
*/
});
