const { expect, generateValidRequestAuhorizationHeader, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Certifications', () => {

  describe('GET /api/certifications', () => {

    let options;
    const authenticatedUserID = 1234;
    let certificationId;

    const session = {
      certificationCenter: 'Université du Pix',
      address: '1 rue de l\'educ',
      room: 'Salle Benjamin Marteau',
      examiner: '',
      date: '14/08',
      time: '11:00',
      description: '',
      accessCode: 'PIX123'
    };

    const certificationCourse = {
      userId: authenticatedUserID,
      completedAt: '2018-02-15T15:15:52.504Z',
      firstName: 'Bro',
      lastName: 'Ther',
      birthdate: '14/08/1993',
      birthplace: 'Asnières IZI',
    };

    const assessment = {
      userId: authenticatedUserID,
      type: 'CERTIFICATION',
      state: 'completed'
    };

    beforeEach(() => {
      return knex('sessions').insert(session)
        .then((sessionId) => {
          certificationCourse.sessionId = sessionId[0];
          return knex('certification-courses').insert(certificationCourse);
        })
        .then((certificationCourseId) => {
          certificationId = certificationCourseId[0];
          assessment.courseId = certificationCourseId[0];
          return knex('assessments').insert(assessment);
        });
    });

    afterEach(() => {
      return Promise.all([
        knex('sessions').delete(),
        knex('assessments').delete(),
        knex('certification-courses').delete(),
      ]);
    });

    it('should return 200 HTTP status code', () => {
      options = {
        method: 'GET',
        url: '/api/certifications',
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([{
          type: 'certifications',
          id: certificationId,
          attributes: {
            'certification-center': 'Université du Pix',
            'date': '2018-02-15T15:15:52.504Z'
          }
        }]);
      });
    });

    it('should return 401 HTTP status code if user is not authenticated', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/certifications',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(401);
      });
    });

  });
});
