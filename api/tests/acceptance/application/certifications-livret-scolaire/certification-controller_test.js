const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  generateValidRequestAuthorizationHeaderForApplication,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { buildOrganization, buildValidatedPublishedCertificationData, mockLearningContentCompetences } = require('../../../../tests/tooling/domain-builder/factory/build-certifications-results-for-ls');

describe('Acceptance | API | Certifications', () => {

  let server, options;
  const LIVRET_SCOLAIRE_CLIENT_ID = 'clientId';
  const LIVRET_SCOLAIRE_SCOPE = 'organizations-certifications-result';
  const LIVRET_SCOLAIRE_SOURCE = 'lsu';

  describe('GET /api/organizations/:id/certifications', () => {
    const pixScore = 400;
    const uai = '789567AA';
    const type = Assessment.types.CERTIFICATION;
    const verificationCode = 'P-123498NN';
    let organizationId;

    const referentialCompetences = {
      'data': [
        {
          'id': '2.1',
          'type': 'competences',
        },
        {
          'id': '2.2',
          'type': 'competences',
        },
        {
          'id': '2.3',
          'type': 'competences',
        },
        {
          'id': '3.1',
          'type': 'competences',
        },
        {
          'id': '3.2',
          'type': 'competences',
        },
        {
          'id': '1.1',
          'type': 'competences',
        },
        {
          'id': '1.2',
          'type': 'competences',
        },
      ],
    };

    const referentialIncludedData = [
      {
        'attributes': {
          'name': 'Communication et collaboration',
        },
        'id': '2',
        'relationships': {},
        'type': 'areas',
      },
      {
        'attributes': {
          'name': 'Interagir',
        },
        'id': '2.1',
        'relationships': {
          'area': {
            'data': {
              'id': '2',
              'type': 'areas',
            },
          },
        },
        'type': 'competences',
      },
      {
        'attributes': {
          'name': 'Partager et publier',
        },
        'id': '2.2',
        'relationships': {
          'area': {
            'data': {
              'id': '2',
              'type': 'areas',
            },
          },
        },
        'type': 'competences',
      },
      {
        'attributes': {
          'name': 'Collaborer',
        },
        'id': '2.3',
        'relationships': {
          'area': {
            'data': {
              'id': '2',
              'type': 'areas',
            },
          },
        },
        'type': 'competences',
      },
      {
        'attributes': {
          'name': 'Création de contenu',
        },
        'id': '3',
        'relationships': {},
        'type': 'areas',
      },
      {
        'attributes': {
          'name': 'Développer des documents textuels',
        },
        'id': '3.1',
        'relationships': {
          'area': {
            'data': {
              'id': '3',
              'type': 'areas',
            },
          },
        },
        'type': 'competences',
      },
      {
        'attributes': {
          'name': 'Développer des documents multimedia',
        },
        'id': '3.2',
        'relationships': {
          'area': {
            'data': {
              'id': '3',
              'type': 'areas',
            },
          },
        },
        'type': 'competences',
      },
      {
        'attributes': {
          'name': 'Information et données',
        },
        'id': '1',
        'relationships': {},
        'type': 'areas',
      },
      {
        'attributes': {
          'name': 'Mener une recherche et une veille d’information',
        },
        'id': '1.1',
        'relationships': {
          'area': {
            'data': {
              'id': '1',
              'type': 'areas',
            },
          },
        },
        'type': 'competences',
      },
      {
        'attributes': {
          'name': 'Gérer des données',
        },
        'id': '1.2',
        'relationships': {
          'area': {
            'data': {
              'id': '1',
              'type': 'areas',
            },
          },
        },
        'type': 'competences',
      },
    ];

    beforeEach(() => {
      organizationId = buildOrganization(uai).id;
      mockLearningContentCompetences();

    });

    context('when the given uai is correct', () => {

      it('should return 200 HTTP status code with the certifications results and referential of competences', async () => {

        // given
        server = await createServer();
        const { schoolingRegistration, session, certificationCourse }
          = buildValidatedPublishedCertificationData({ organizationId, verificationCode, type, pixScore, competenceMarks: [ { code: '1.1', level: 6 }, { code: '5.2', level: 4 }] });
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/organizations/${uai}/certifications`,
          headers: { authorization: generateValidRequestAuthorizationHeaderForApplication(LIVRET_SCOLAIRE_CLIENT_ID, LIVRET_SCOLAIRE_SOURCE, LIVRET_SCOLAIRE_SCOPE) },

        };

        // when
        const response = await server.inject(options);

        // then
        const expectedCertificationResult = {
          'data': {
            'attributes': {
              'certifications':
                [
                  {
                    id: certificationCourse.id,
                    firstName: schoolingRegistration.firstName,
                    middleName: schoolingRegistration.middleName,
                    thirdName: schoolingRegistration.thirdName,
                    lastName: schoolingRegistration.lastName,
                    nationalStudentId: schoolingRegistration.nationalStudentId,
                    birthdate: schoolingRegistration.birthdate,
                    date: certificationCourse.createdAt,
                    verificationCode: certificationCourse.verificationCode,
                    deliveredAt: session.publishedAt,
                    certificationCenter: session.certificationCenter,
                    status: 'validated',
                    pixScore,
                    competenceResults: [
                      { competenceId: '1.1', level: 6 },
                      { competenceId: '5.2', level: 4 },
                    ],
                  },
                ],
            },
            'relationships': {
              'competences': referentialCompetences,
            },
            'type': 'certificationsResults',
          },
          'included': referentialIncludedData,
        };

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedCertificationResult);
      });
    });

    context('when the given uai is incorrect', () => {

      it('should return 200 HTTP status code with the referential of competences only', async () => {

        // given
        server = await createServer();
        options = {
          method: 'GET',
          url: '/api/organizations/9999/certifications',
          headers: { authorization: generateValidRequestAuthorizationHeaderForApplication(LIVRET_SCOLAIRE_CLIENT_ID, LIVRET_SCOLAIRE_SOURCE, LIVRET_SCOLAIRE_SCOPE) },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedCertificationResult = {
          'data': {
            'attributes': {
              'certifications':
                [],
            },
            'relationships': {
              'competences': referentialCompetences,
            },
            'type': 'certificationsResults',
          },
          'included': referentialIncludedData,
        };

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedCertificationResult);
      });
    });

    context('when the access token is generated by password credential grant to authenticate end user', () => {

      it('should return unauthorized status code', async () => {

        // given
        server = await createServer();
        options = {
          method: 'GET',
          url: '/api/organizations/9999/certifications',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when the access token is generated by client credential grant with the wrong client id', () => {

      it('should return unauthorized status code', async () => {

        // given
        server = await createServer();
        options = {
          method: 'GET',
          url: '/api/organizations/9999/certifications',
          headers: { authorization: generateValidRequestAuthorizationHeaderForApplication('') },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when the access token is generated by client credential grant with wrong livret scolaire scope', () => {

      it('should return Forbidden access status code', async () => {

        // given
        server = await createServer();
        options = {
          method: 'GET',
          url: '/api/organizations/9999/certifications',
          headers: { authorization: generateValidRequestAuthorizationHeaderForApplication(LIVRET_SCOLAIRE_CLIENT_ID, LIVRET_SCOLAIRE_SOURCE) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

});
