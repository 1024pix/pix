const {
  knex,
  expect,
  airtableBuilder,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithStandardRole,
  insertUserWithRolePixMaster,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { map } = require('lodash');

describe('Acceptance | API | Certifications', () => {

  let server, options;
  const authenticatedUserID = 1234;
  let session, certificationCourse, assessment, assessmentResult;

  beforeEach(async function() {
    server = await createServer();

    session = databaseBuilder.factory.buildSession();
    await insertUserWithRolePixMaster();
    await insertUserWithStandardRole();
    certificationCourse = databaseBuilder.factory.buildCertificationCourse({
      sessionId: session.id,
      userId: authenticatedUserID,
      isPublished: false
    });
    assessment = databaseBuilder.factory.buildAssessment({
      userId: authenticatedUserID,
      courseId: certificationCourse.id,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    });
    assessmentResult = databaseBuilder.factory.buildAssessmentResult({
      assessmentId: assessment.id,
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
    });
  });

  describe('GET /api/certifications', () => {
    beforeEach(function() {
      return databaseBuilder.commit();
    });

    it('should return 200 HTTP status code', () => {
      options = {
        method: 'GET',
        url: '/api/certifications',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            type: 'certifications',
            id: `${certificationCourse.id}`,
            attributes: {
              'birthdate': certificationCourse.birthdate,
              'birthplace': certificationCourse.birthplace,
              'certification-center': session.certificationCenter,
              'comment-for-candidate': assessmentResult.commentForCandidate,
              'date': certificationCourse.completedAt,
              'first-name': certificationCourse.firstName,
              'is-published': certificationCourse.isPublished,
              'last-name': certificationCourse.lastName,
              'pix-score': assessmentResult.pixScore,
              'status': assessmentResult.status,
            },
            relationships: {
              'result-competence-tree': {
                'data': null,
              },
            },
          },
        ]);
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

  describe('GET /api/certifications/:id', () => {
    before(function() {
      const area = airtableBuilder.factory.buildArea();
      airtableBuilder.mockList({ tableName: 'Domaines' })
        .returns([area])
        .activate();

      const epreuves = [
        'rec02tVrimXNkgaLD',
        'rec0gm0GFue3PQB3k',
        'rec0hoSlSwCeNNLkq',
        'rec2FcZ4jsPuY1QYt',
        'rec39bDMnaVw3MyMR',
        'rec3FMoD8h9USTktb',
        'rec3P7fvPSpFkIFLV',
      ];
      const competences = map([{
        id: 'recsvLz0W2ShyfD63',
        epreuves,
        sousDomaine: '1.1',
        titre: 'Mener une recherche et une veille d’information',
      }, {
        id: 'recNv8qhaY887jQb2',
        epreuves,
        sousDomaine: '1.2',
        titre: 'Gérer des données',
      }, {
        id: 'recIkYm646lrGvLNT',
        epreuves,
        sousDomaine: '1.3',
        titre: 'Traiter des données',
      }], (competence) => airtableBuilder.factory.buildCompetence(competence));

      airtableBuilder.mockList({ tableName: 'Competences' })
        .returns(competences)
        .activate();
    });

    beforeEach(async function() {
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.1',
        assessmentResultId: assessmentResult.id,
      });
      return databaseBuilder.commit();
    });

    it('should return 200 HTTP status code and the certification with the result competence tree included', () => {
      // given
      options = {
        method: 'GET',
        url: `/api/certifications/${certificationCourse.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(authenticatedUserID) },
      };

      // when
      const promise = server.inject(options);

      // then
      const expectedBody = {
        'data': {
          'attributes': {
            'birthdate': certificationCourse.birthdate,
            'birthplace': certificationCourse.birthplace,
            'certification-center': session.certificationCenter,
            'comment-for-candidate': assessmentResult.commentForCandidate,
            'date': certificationCourse.completedAt,
            'first-name': certificationCourse.firstName,
            'is-published': certificationCourse.isPublished,
            'last-name': certificationCourse.lastName,
            'pix-score': assessmentResult.pixScore,
            'status': assessmentResult.status,
          },
          'id': `${certificationCourse.id}`,
          'relationships': {
            'result-competence-tree': {
              'data': {
                'id': `${certificationCourse.id}-${assessmentResult.id}`,
                'type': 'result-competence-trees',
              },
            },
          },
          'type': 'certifications',
        },
        'included': [
          {
            'attributes': {
              'index': '1.1',
              'level': 3,
              'name': 'Mener une recherche et une veille d’information',
              'score': 23,
            },
            'id': 'recsvLz0W2ShyfD63',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'index': '1.2',
              'level': -1,
              'name': 'Gérer des données',
              'score': 0,
            },
            'id': 'recNv8qhaY887jQb2',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'index': '1.3',
              'level': -1,
              'name': 'Traiter des données',
              'score': 0,
            },
            'id': 'recIkYm646lrGvLNT',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'code': '1',
              'name': '1. Information et données',
              'title': 'Information et données',
            },
            'id': 'recvoGdo7z2z7pXWa',
            'relationships': {
              'result-competences': {
                'data': [
                  {
                    'id': 'recsvLz0W2ShyfD63',
                    'type': 'result-competences',
                  },
                  {
                    'id': 'recNv8qhaY887jQb2',
                    'type': 'result-competences',
                  },
                  {
                    'id': 'recIkYm646lrGvLNT',
                    'type': 'result-competences',
                  },
                ],
              },
            },
            'type': 'areas',
          },
          {
            'attributes': {
              'id': `${certificationCourse.id}-${assessmentResult.id}`,
            },
            'id': `${certificationCourse.id}-${assessmentResult.id}`,
            'relationships': {
              'areas': {
                'data': [
                  {
                    'id': 'recvoGdo7z2z7pXWa',
                    'type': 'areas',
                  },
                ],
              },
            },
            'type': 'result-competence-trees',
          },
        ],
      };
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(expectedBody);
        });
    });

    it('should return unauthorized 403 HTTP status code when user is not owner of the certification', () => {
      // given
      const unauthenticatedUserId = authenticatedUserID + 1;
      options = {
        method: 'GET',
        url: `/api/certifications/${certificationCourse.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(unauthenticatedUserId) },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => expect(response.statusCode).to.equal(403));
    });
  });

  describe('PATCH /api/certifications/:id', () => {
    beforeEach(function() {
      return databaseBuilder.commit();
    });

    it('should return 200 HTTP status code and the updated certification', () => {
      // given
      options = {
        method: 'PATCH',
        url: `/api/certifications/${certificationCourse.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        payload: {
          data: {
            type: 'certifications',
            id: certificationCourse.id,
            attributes: {
              'is-published': true,
            },
          },
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.deep.equal({
            type: 'certifications',
            id: `${certificationCourse.id}`,
            attributes: {
              'birthdate': certificationCourse.birthdate,
              'birthplace': certificationCourse.birthplace,
              'certification-center': session.certificationCenter,
              'comment-for-candidate': assessmentResult.commentForCandidate,
              'date': certificationCourse.completedAt,
              'first-name': certificationCourse.firstName,
              'is-published': true,
              'last-name': certificationCourse.lastName,
              'pix-score': assessmentResult.pixScore,
              'status': assessmentResult.status,
            },
            relationships: {
              'result-competence-tree': {
                'data': null,
              },
            },
          });
        })
        .then(() => knex('certification-courses').where('id', certificationCourse.id))
        .then((foundCertification) => expect(foundCertification[0].isPublished).to.be.true);
    });

    it('should return unauthorized 403 HTTP status code when user is not pixMaster', () => {
      // given
      options = {
        method: 'PATCH',
        url: `/api/certifications/${certificationCourse.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(4444) },
        payload: {
          data: {
            attributes: {
              'is-published': true,
            },
          },
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => expect(response.statusCode).to.equal(403))
        .then(() => knex('certification-courses').where('id', certificationCourse.id))
        .then((certifications) => expect(certifications[0].isPublished).to.be.false);
    });
  });

});
