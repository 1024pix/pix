const {
  expect,
  databaseBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { buildOrganization, buildValidatedPublishedCertificationData, mockLearningContentCompetences } = require('../../../../tests/tooling/domain-builder/factory/build-certifications-results-for-ls');
const config = require('../../../../lib/config');

describe('Acceptance | API | Certifications', () => {

  let server, options;

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
        config.featureToggles.isLivretScolaireSandboxApiEnabled = true;
        server = await createServer();
        const { schoolingRegistration, session, certificationCourse }
          = buildValidatedPublishedCertificationData({ organizationId, verificationCode, type, pixScore, competenceMarks: [ { code: '1.1', level: 6 }, { code: '5.2', level: 4 }] });
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/organizations/${uai}/certifications`,
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
        config.featureToggles.isLivretScolaireSandboxApiEnabled = true;
        server = await createServer();
        options = {
          method: 'GET',
          url: '/api/organizations/9999/certifications',
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

    context('when the feature toggle is disabled', () => {

      it('should return unauthorized status ', async () => {

        config.featureToggles.isLivretScolaireSandboxApiEnabled = false;
        server = await createServer();

        // given
        options = {
          method: 'GET',
          url: `/api/organizations/${uai}/certifications`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

});
