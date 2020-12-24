const {
  expect,
  airtableBuilder,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { map } = require('lodash');

describe('Acceptance | API | Certifications', () => {

  let server, options;
  let userId;
  let session, certificationCourse, assessment, assessmentResult, badge;

  beforeEach(async () => {
    server = await createServer();

    userId = databaseBuilder.factory.buildUser().id;
    session = databaseBuilder.factory.buildSession({ publishedAt: new Date('2018-12-01T01:02:03Z') });
    badge = databaseBuilder.factory.buildBadge({ key: 'charlotte_aux_fraises' });
    certificationCourse = databaseBuilder.factory.buildCertificationCourse({
      sessionId: session.id,
      userId,
      isPublished: true,
      maxReachableLevelOnCertificationDate: 3,
    });
    assessment = databaseBuilder.factory.buildAssessment({
      userId,
      certificationCourseId: certificationCourse.id,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    });
    assessmentResult = databaseBuilder.factory.buildAssessmentResult({
      assessmentId: assessment.id,
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'validated',
    });
    databaseBuilder.factory.buildPartnerCertification({
      certificationCourseId: certificationCourse.id,
      partnerKey: badge.key,
    });

    return databaseBuilder.commit();
  });

  describe('GET /api/certifications', () => {

    it('should return 200 HTTP status code', async () => {
      options = {
        method: 'GET',
        url: '/api/certifications',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      // when
      const response = await server.inject(options);

      // then
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
            'date': certificationCourse.createdAt,
            'first-name': certificationCourse.firstName,
            'delivered-at': session.publishedAt,
            'is-published': certificationCourse.isPublished,
            'last-name': certificationCourse.lastName,
            'pix-score': assessmentResult.pixScore,
            'status': assessmentResult.status,
            'clea-certification-status': 'not_passed',
            'verification-code': certificationCourse.verificationCode,
            'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
          },
          relationships: {
            'result-competence-tree': {
              'data': null,
            },
          },
        },
      ]);
    });

    it('should return 401 HTTP status code if user is not authenticated', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/certifications',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
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

    after(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    beforeEach(() => {
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.1',
        assessmentResultId: assessmentResult.id,
        acquiredPartnerCertifications: [badge.key],
      });
      return databaseBuilder.commit();
    });

    it('should return 200 HTTP status code and the certification with the result competence tree included', async () => {
      // given
      options = {
        method: 'GET',
        url: `/api/certifications/${certificationCourse.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      const expectedBody = {
        'data': {
          'attributes': {
            'birthdate': certificationCourse.birthdate,
            'birthplace': certificationCourse.birthplace,
            'certification-center': session.certificationCenter,
            'comment-for-candidate': assessmentResult.commentForCandidate,
            'date': certificationCourse.createdAt,
            'first-name': certificationCourse.firstName,
            'delivered-at': session.publishedAt,
            'is-published': certificationCourse.isPublished,
            'last-name': certificationCourse.lastName,
            'pix-score': assessmentResult.pixScore,
            'status': assessmentResult.status,
            'clea-certification-status': 'not_passed',
            'verification-code': certificationCourse.verificationCode,
            'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
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
              'color': 'jaffa',
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
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedBody);
    });

    it('should return notFound 404 HTTP status code when user is not owner of the certification', async () => {
      // given
      const unauthenticatedUserId = userId + 1;
      options = {
        method: 'GET',
        url: `/api/certifications/${certificationCourse.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(unauthenticatedUserId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/shared-certifications', () => {
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

    beforeEach(() => {
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.1',
        assessmentResultId: assessmentResult.id,
        acquiredPartnerCertifications: [badge.key],
      });
      return databaseBuilder.commit();
    });

    context('when the given verificationCode is correct', () => {

      it('should return 200 HTTP status code and the certification', async () => {
        // given
        const verificationCode = certificationCourse.verificationCode;
        options = {
          method: 'POST',
          url: '/api/shared-certifications',
          payload: { verificationCode },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedBody = {
          'data': {
            'attributes': {
              'birthdate': certificationCourse.birthdate,
              'birthplace': certificationCourse.birthplace,
              'certification-center': session.certificationCenter,
              'date': certificationCourse.createdAt,
              'first-name': certificationCourse.firstName,
              'delivered-at': session.publishedAt,
              'is-published': certificationCourse.isPublished,
              'last-name': certificationCourse.lastName,
              'pix-score': assessmentResult.pixScore,
              'status': assessmentResult.status,
              'clea-certification-status': 'not_passed',
              'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
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
                'color': 'jaffa',
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
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedBody);
      });
    });

    context('when the given verificationCode is incorrect', () => {

      it('should return 500 HTTP status code when param is missing', async () => {
        // given
        options = {
          method: 'POST',
          url: '/api/shared-certifications',
          payload: {},
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(500);
      });

      it('should return notFound 404 HTTP status code when param is incorrect', async () => {
        // given
        const verificationCode = 'P-WRONG-CODE';
        options = {
          method: 'POST',
          url: '/api/shared-certifications',
          payload: { verificationCode },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

  });

  describe('GET /api/attestation/pdf', () => {
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

    after(() => {
      airtableBuilder.cleanAll();
      return cache.flushAll();
    });

    beforeEach(() => {
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.1',
        assessmentResultId: assessmentResult.id,
        acquiredPartnerCertifications: [badge.key],
      });
      return databaseBuilder.commit();
    });

    context('when user own the certification', () => {
      it('should return 200 HTTP status code and the certification', async () => {
        // given
        options = {
          method: 'GET',
          url: `/api/attestation/${certificationCourse.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.include('filename=attestation-pix');
        expect(response.file).not.to.be.null;
      });
    });
  });
});
