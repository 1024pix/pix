import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { generateCertificateVerificationCode } from '../../../../../lib/domain/services/verify-certificate-code-service.js';
describe('Acceptance | Route | certification-attestation', function () {
  beforeEach(async function () {
    const learningContent = [
      {
        id: 'recvoGdo7z2z7pXWa',
        code: '1',
        name: '1. Information et données',
        title_i18n: { fr: 'Information et données' },
        color: 'jaffa',
        competences: [
          {
            id: 'recsvLz0W2ShyfD63',
            name_i18n: { fr: 'Mener une recherche et une veille d’information' },
            index: '1.1',
            tubes: [
              {
                id: 'recTube1',
                skills: [
                  {
                    id: 'recSkillId1',
                    challenges: [
                      'rec02tVrimXNkgaLD',
                      'rec0gm0GFue3PQB3k',
                      'rec0hoSlSwCeNNLkq',
                      'rec2FcZ4jsPuY1QYt',
                      'rec39bDMnaVw3MyMR',
                      'rec3FMoD8h9USTktb',
                      'rec3P7fvPSpFkIFLV',
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recNv8qhaY887jQb2',
            name_i18n: { fr: 'Gérer des données' },
            index: '1.2',
            tubes: [
              {
                id: 'recTube2',
                skills: [
                  {
                    id: 'recSkillId2',
                    challenges: [
                      'rec02tVrimXNkgaLD',
                      'rec0gm0GFue3PQB3k',
                      'rec0hoSlSwCeNNLkq',
                      'rec2FcZ4jsPuY1QYt',
                      'rec39bDMnaVw3MyMR',
                      'rec3FMoD8h9USTktb',
                      'rec3P7fvPSpFkIFLV',
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recIkYm646lrGvLNT',
            name_i18n: { fr: 'Traiter des données' },
            index: '1.3',
            tubes: [
              {
                id: 'recTube3',
                skills: [
                  {
                    id: 'recSkillId3',
                    challenges: [
                      'rec02tVrimXNkgaLD',
                      'rec0gm0GFue3PQB3k',
                      'rec0hoSlSwCeNNLkq',
                      'rec2FcZ4jsPuY1QYt',
                      'rec39bDMnaVw3MyMR',
                      'rec3FMoD8h9USTktb',
                      'rec3P7fvPSpFkIFLV',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);
  });

  describe('GET /api/attestation/', function () {
    context('when user own the certification', function () {
      it('should return 200 HTTP status code and the certification', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const session = databaseBuilder.factory.buildSession({ publishedAt: new Date('2018-12-01T01:02:03Z') });
        const badge = databaseBuilder.factory.buildBadge({ key: 'charlotte_aux_fraises' });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          id: 1234,
          sessionId: session.id,
          userId,
          isPublished: true,
          maxReachableLevelOnCertificationDate: 3,
          verificationCode: await generateCertificateVerificationCode(),
        });
        const assessment = databaseBuilder.factory.buildAssessment({
          userId,
          certificationCourseId: certificationCourse.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });
        const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourse.id,
          assessmentId: assessment.id,
          level: 1,
          pixScore: 23,
          emitter: 'PIX-ALGO',
          status: 'validated',
        });
        const { id } = databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId: certificationCourse.id,
          name: 'patisseries au fruits',
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: id,
          partnerKey: badge.key,
        });
        databaseBuilder.factory.buildCompetenceMark({
          level: 3,
          score: 23,
          area_code: '1',
          competence_code: '1.1',
          assessmentResultId: assessmentResult.id,
          acquiredComplementaryCertifications: [badge.key],
        });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/attestation/1234?isFrenchDomainExtension=true&lang=fr',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.include('filename=attestation-pix');
        expect(response.file).not.to.be.null;
      });
    });
  });
});
