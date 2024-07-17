import { generateCertificateVerificationCode } from '../../../../../lib/domain/services/verify-certificate-code-service.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Certification | Results | Acceptance | Application | Certification', function () {
  let server, options;
  let userId;
  let session, certificationCourse, assessment, assessmentResult, badge;

  beforeEach(async function () {
    server = await createServer();

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

  describe('GET /api/certifications/:id', function () {
    beforeEach(async function () {
      ({ userId, session, badge, certificationCourse, assessmentResult } = await _buildDatabaseForV2Certification());
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.1',
        assessmentResultId: assessmentResult.id,
        acquiredComplementaryCertifications: [badge.key],
      });
      await databaseBuilder.commit();
    });

    it('should return 200 HTTP status code and the certification with the result competence tree included', async function () {
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
        data: {
          attributes: {
            birthdate: certificationCourse.birthdate,
            birthplace: certificationCourse.birthplace,
            'certification-center': session.certificationCenter,
            'comment-for-candidate':
              "Les conditions de passation du test de certification n'ayant pas été respectées et ayant fait l'objet d'un signalement pour fraude, votre certification a été invalidée en conséquence.",
            date: certificationCourse.createdAt,
            'first-name': certificationCourse.firstName,
            'delivered-at': session.publishedAt,
            'is-published': certificationCourse.isPublished,
            'last-name': certificationCourse.lastName,
            'pix-score': assessmentResult.pixScore,
            status: assessmentResult.status,
            'certified-badge-images': [
              {
                imageUrl: 'http://tarte.fr/mirabelle.png',
                isTemporaryBadge: false,
                label: 'tarte à la mirabelle',
                stickerUrl: 'http://tarte.fr/sticker.png',
                message: 'Miam',
              },
            ],
            'verification-code': certificationCourse.verificationCode,
            'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
          },
          id: `${certificationCourse.id}`,
          relationships: {
            'result-competence-tree': {
              data: {
                id: `${certificationCourse.id}-${assessmentResult.id}`,
                type: 'result-competence-trees',
              },
            },
          },
          type: 'certifications',
        },
        included: [
          {
            attributes: {
              index: '1.1',
              level: 3,
              name: 'Mener une recherche et une veille d’information',
              score: 23,
            },
            id: 'recsvLz0W2ShyfD63',
            type: 'result-competences',
          },
          {
            attributes: {
              index: '1.2',
              level: -1,
              name: 'Gérer des données',
              score: 0,
            },
            id: 'recNv8qhaY887jQb2',
            type: 'result-competences',
          },
          {
            attributes: {
              index: '1.3',
              level: -1,
              name: 'Traiter des données',
              score: 0,
            },
            id: 'recIkYm646lrGvLNT',
            type: 'result-competences',
          },
          {
            attributes: {
              code: '1',
              name: '1. Information et données',
              title: 'Information et données',
              color: 'jaffa',
            },
            id: 'recvoGdo7z2z7pXWa',
            relationships: {
              'result-competences': {
                data: [
                  {
                    id: 'recsvLz0W2ShyfD63',
                    type: 'result-competences',
                  },
                  {
                    id: 'recNv8qhaY887jQb2',
                    type: 'result-competences',
                  },
                  {
                    id: 'recIkYm646lrGvLNT',
                    type: 'result-competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
          {
            attributes: {
              id: `${certificationCourse.id}-${assessmentResult.id}`,
            },
            id: `${certificationCourse.id}-${assessmentResult.id}`,
            relationships: {
              areas: {
                data: [
                  {
                    id: 'recvoGdo7z2z7pXWa',
                    type: 'areas',
                  },
                ],
              },
            },
            type: 'result-competence-trees',
          },
        ],
      };
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedBody);
    });

    it('should return notFound 404 HTTP status code when user is not owner of the certification', async function () {
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

  describe('GET /api/certifications', function () {
    context('when certification is v2', function () {
      beforeEach(async function () {
        ({ userId, session, certificationCourse, assessment, assessmentResult } =
          await _buildDatabaseForV2Certification());

        await databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async function () {
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
              birthdate: certificationCourse.birthdate,
              birthplace: certificationCourse.birthplace,
              'certification-center': session.certificationCenter,
              'comment-for-candidate':
                "Les conditions de passation du test de certification n'ayant pas été respectées et ayant fait l'objet d'un signalement pour fraude, votre certification a été invalidée en conséquence.",
              date: certificationCourse.createdAt,
              'first-name': certificationCourse.firstName,
              'delivered-at': session.publishedAt,
              'is-published': certificationCourse.isPublished,
              'last-name': certificationCourse.lastName,
              'pix-score': assessmentResult.pixScore,
              status: assessmentResult.status,
              'certified-badge-images': [],
              'verification-code': certificationCourse.verificationCode,
              'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
            },
            relationships: {
              'result-competence-tree': {
                data: null,
              },
            },
          },
        ]);
      });

      it('should return 401 HTTP status code if user is not authenticated', async function () {
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

    context('when certification is v3', function () {
      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        session = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2018-12-01T01:02:03Z'),
          version: 3,
        });
        certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          isPublished: true,
          maxReachableLevelOnCertificationDate: 3,
          verificationCode: await generateCertificateVerificationCode(),
          version: 3,
        });

        assessment = databaseBuilder.factory.buildAssessment({
          userId,
          certificationCourseId: certificationCourse.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });
        assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourse.id,
          assessmentId: assessment.id,
          level: 1,
          pixScore: 23,
          emitter: 'PIX-ALGO',
          status: 'validated',
        });

        await databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async function () {
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
              birthdate: certificationCourse.birthdate,
              birthplace: certificationCourse.birthplace,
              'certification-center': session.certificationCenter,
              'comment-for-candidate': assessmentResult.commentForCandidate,
              date: certificationCourse.createdAt,
              'first-name': certificationCourse.firstName,
              'delivered-at': session.publishedAt,
              'is-published': certificationCourse.isPublished,
              'last-name': certificationCourse.lastName,
              'pix-score': assessmentResult.pixScore,
              status: assessmentResult.status,
              'certified-badge-images': [],
              'verification-code': certificationCourse.verificationCode,
              'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
            },
            relationships: {
              'result-competence-tree': {
                data: null,
              },
            },
          },
        ]);
      });
    });
  });

  describe('POST /api/shared-certifications', function () {
    beforeEach(async function () {
      ({ session, badge, certificationCourse, assessmentResult } = await _buildDatabaseForV2Certification());
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.1',
        assessmentResultId: assessmentResult.id,
        acquiredComplementaryCertifications: [badge.key],
      });
      await databaseBuilder.commit();
    });

    context('when the given verificationCode is correct', function () {
      it('should return 200 HTTP status code and the certification', async function () {
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
          data: {
            attributes: {
              birthdate: certificationCourse.birthdate,
              birthplace: certificationCourse.birthplace,
              'certification-center': session.certificationCenter,
              date: certificationCourse.createdAt,
              'first-name': certificationCourse.firstName,
              'delivered-at': session.publishedAt,
              'is-published': certificationCourse.isPublished,
              'last-name': certificationCourse.lastName,
              'pix-score': assessmentResult.pixScore,
              'certified-badge-images': [
                {
                  imageUrl: 'http://tarte.fr/mirabelle.png',
                  isTemporaryBadge: false,
                  label: 'tarte à la mirabelle',
                  stickerUrl: 'http://tarte.fr/sticker.png',
                  message: 'Miam',
                },
              ],
              'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
            },
            id: `${certificationCourse.id}`,
            relationships: {
              'result-competence-tree': {
                data: {
                  id: `${certificationCourse.id}-${assessmentResult.id}`,
                  type: 'result-competence-trees',
                },
              },
            },
            type: 'certifications',
          },
          included: [
            {
              attributes: {
                index: '1.1',
                level: 3,
                name: 'Mener une recherche et une veille d’information',
                score: 23,
              },
              id: 'recsvLz0W2ShyfD63',
              type: 'result-competences',
            },
            {
              attributes: {
                index: '1.2',
                level: -1,
                name: 'Gérer des données',
                score: 0,
              },
              id: 'recNv8qhaY887jQb2',
              type: 'result-competences',
            },
            {
              attributes: {
                index: '1.3',
                level: -1,
                name: 'Traiter des données',
                score: 0,
              },
              id: 'recIkYm646lrGvLNT',
              type: 'result-competences',
            },
            {
              attributes: {
                code: '1',
                name: '1. Information et données',
                title: 'Information et données',
                color: 'jaffa',
              },
              id: 'recvoGdo7z2z7pXWa',
              relationships: {
                'result-competences': {
                  data: [
                    {
                      id: 'recsvLz0W2ShyfD63',
                      type: 'result-competences',
                    },
                    {
                      id: 'recNv8qhaY887jQb2',
                      type: 'result-competences',
                    },
                    {
                      id: 'recIkYm646lrGvLNT',
                      type: 'result-competences',
                    },
                  ],
                },
              },
              type: 'areas',
            },
            {
              attributes: {
                id: `${certificationCourse.id}-${assessmentResult.id}`,
              },
              id: `${certificationCourse.id}-${assessmentResult.id}`,
              relationships: {
                areas: {
                  data: [
                    {
                      id: 'recvoGdo7z2z7pXWa',
                      type: 'areas',
                    },
                  ],
                },
              },
              type: 'result-competence-trees',
            },
          ],
        };
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedBody);
      });
    });

    context('when the given verificationCode is incorrect', function () {
      it('should return 500 HTTP status code when param is missing', async function () {
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

      it('should return notFound 404 HTTP status code when param is incorrect', async function () {
        // given
        const verificationCode = 'P-12345678';
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
});

async function _buildDatabaseForV2Certification() {
  const userId = databaseBuilder.factory.buildUser().id;
  const session = databaseBuilder.factory.buildSession({ publishedAt: new Date('2018-12-01T01:02:03Z') });
  const badge = databaseBuilder.factory.buildBadge({ key: 'charlotte_aux_fraises' });
  const cc = databaseBuilder.factory.buildComplementaryCertification({ key: 'A' });
  const ccBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
    complementaryCertificationId: cc.id,
    badgeId: badge.id,
    imageUrl: 'http://tarte.fr/mirabelle.png',
    isTemporaryBadge: false,
    label: 'tarte à la mirabelle',
    certificateMessage: 'Miam',
    stickerUrl: 'http://tarte.fr/sticker.png',
  });
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
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
    commentByAutoJury: AutoJuryCommentKeys.FRAUD,
  });
  const { id } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: certificationCourse.id,
    complementaryCertificationCourseId: cc.id,
    name: 'patisseries au fruits',
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: id,
    complementaryCertificationBadgeId: ccBadge.id,
  });
  return { userId, session, badge, certificationCourse, assessment, assessmentResult };
}
