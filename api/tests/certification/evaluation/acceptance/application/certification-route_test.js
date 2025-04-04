import dayjs from 'dayjs';

import { generateCertificateVerificationCode } from '../../../../../src/certification/evaluation/domain/services/verify-certificate-code-service.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { SESSIONS_VERSIONS } from '../../../../../src/certification/shared/domain/models/SessionVersion.js';
import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { AssessmentResult, Membership } from '../../../../../src/shared/domain/models/index.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Certification | Results | Acceptance | Application | Certification', function () {
  let server, options;
  let userId;
  let session, certificationCourse, assessment, assessmentResult, badge;

  describe('GET /api/certifications/{certificationCourseId}', function () {
    beforeEach(async function () {
      server = await createServer();

      const learningContent = [
        {
          id: 'recvoGdo7z2z7pXWa',
          code: '1',
          name: '1. Information et données',
          title_i18n: { fr: 'Information et données' },
          color: 'jaffa',
          frameworkId: 'Pix',
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
                        { id: 'rec02tVrimXNkgaLD1' },
                        { id: 'rec0gm0GFue3PQB3k1' },
                        { id: 'rec0hoSlSwCeNNLkq1' },
                        { id: 'rec2FcZ4jsPuY1QYt1' },
                        { id: 'rec39bDMnaVw3MyMR1' },
                        { id: 'rec3FMoD8h9USTktb1' },
                        { id: 'rec3P7fvPSpFkIFLV1' },
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
                        { id: 'rec02tVrimXNkgaLD2' },
                        { id: 'rec0gm0GFue3PQB3k2' },
                        { id: 'rec0hoSlSwCeNNLkq2' },
                        { id: 'rec2FcZ4jsPuY1QYt2' },
                        { id: 'rec39bDMnaVw3MyMR2' },
                        { id: 'rec3FMoD8h9USTktb2' },
                        { id: 'rec3P7fvPSpFkIFLV2' },
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
                        { id: 'rec02tVrimXNkgaLD3' },
                        { id: 'rec0gm0GFue3PQB3k3' },
                        { id: 'rec0hoSlSwCeNNLkq3' },
                        { id: 'rec2FcZ4jsPuY1QYt3' },
                        { id: 'rec39bDMnaVw3MyMR3' },
                        { id: 'rec3FMoD8h9USTktb3' },
                        { id: 'rec3P7fvPSpFkIFLV3' },
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
      await mockLearningContent(learningContentObjects);

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
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
            version: SESSIONS_VERSIONS.V2,
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: unauthenticatedUserId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/certifications', function () {
    beforeEach(async function () {
      server = await createServer();

      const learningContent = [
        {
          id: 'recvoGdo7z2z7pXWa',
          code: '1',
          name: '1. Information et données',
          title_i18n: { fr: 'Information et données' },
          color: 'jaffa',
          frameworkId: 'Pix',
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
                        { id: 'rec02tVrimXNkgaLD1' },
                        { id: 'rec0gm0GFue3PQB3k1' },
                        { id: 'rec0hoSlSwCeNNLkq1' },
                        { id: 'rec2FcZ4jsPuY1QYt1' },
                        { id: 'rec39bDMnaVw3MyMR1' },
                        { id: 'rec3FMoD8h9USTktb1' },
                        { id: 'rec3P7fvPSpFkIFLV1' },
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
                        { id: 'rec02tVrimXNkgaLD2' },
                        { id: 'rec0gm0GFue3PQB3k2' },
                        { id: 'rec0hoSlSwCeNNLkq2' },
                        { id: 'rec2FcZ4jsPuY1QYt2' },
                        { id: 'rec39bDMnaVw3MyMR2' },
                        { id: 'rec3FMoD8h9USTktb2' },
                        { id: 'rec3P7fvPSpFkIFLV2' },
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
                        { id: 'rec02tVrimXNkgaLD3' },
                        { id: 'rec0gm0GFue3PQB3k3' },
                        { id: 'rec0hoSlSwCeNNLkq3' },
                        { id: 'rec2FcZ4jsPuY1QYt3' },
                        { id: 'rec39bDMnaVw3MyMR3' },
                        { id: 'rec3FMoD8h9USTktb3' },
                        { id: 'rec3P7fvPSpFkIFLV3' },
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
      await mockLearningContent(learningContentObjects);
    });

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
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
              version: SESSIONS_VERSIONS.V2,
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
          version: SESSIONS_VERSIONS.V3,
        });
        certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          isPublished: true,
          maxReachableLevelOnCertificationDate: 3,
          verificationCode: await generateCertificateVerificationCode(),
          version: SESSIONS_VERSIONS.V3,
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
          status: 'validated',
        });

        await databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async function () {
        options = {
          method: 'GET',
          url: '/api/certifications',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
              version: SESSIONS_VERSIONS.V3,
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
      server = await createServer();

      const learningContent = [
        {
          id: 'recvoGdo7z2z7pXWa',
          code: '1',
          name: '1. Information et données',
          title_i18n: { fr: 'Information et données' },
          color: 'jaffa',
          frameworkId: 'Pix',
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
                        { id: 'rec02tVrimXNkgaLD1' },
                        { id: 'rec0gm0GFue3PQB3k1' },
                        { id: 'rec0hoSlSwCeNNLkq1' },
                        { id: 'rec2FcZ4jsPuY1QYt1' },
                        { id: 'rec39bDMnaVw3MyMR1' },
                        { id: 'rec3FMoD8h9USTktb1' },
                        { id: 'rec3P7fvPSpFkIFLV1' },
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
                        { id: 'rec02tVrimXNkgaLD2' },
                        { id: 'rec0gm0GFue3PQB3k2' },
                        { id: 'rec0hoSlSwCeNNLkq2' },
                        { id: 'rec2FcZ4jsPuY1QYt2' },
                        { id: 'rec39bDMnaVw3MyMR2' },
                        { id: 'rec3FMoD8h9USTktb2' },
                        { id: 'rec3P7fvPSpFkIFLV2' },
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
                        { id: 'rec02tVrimXNkgaLD3' },
                        { id: 'rec0gm0GFue3PQB3k3' },
                        { id: 'rec0hoSlSwCeNNLkq3' },
                        { id: 'rec2FcZ4jsPuY1QYt3' },
                        { id: 'rec39bDMnaVw3MyMR3' },
                        { id: 'rec3FMoD8h9USTktb3' },
                        { id: 'rec3P7fvPSpFkIFLV3' },
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
      await mockLearningContent(learningContentObjects);

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
              version: session.version,
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

  describe('GET /api/attestation/{certificationCourseId}', function () {
    context('when user own the certification', function () {
      context('when session version is V3', function () {
        context('when isV3CertificationAttestationEnabled feature toggle is truthy', function () {
          it('should return 200 HTTP status code and the certification', async function () {
            // given
            await featureToggles.set('isV3CertificationAttestationEnabled', true);
            const userId = databaseBuilder.factory.buildUser().id;

            const session = databaseBuilder.factory.buildSession({
              id: 123,
              publishedAt: new Date('2018-12-01T01:02:03Z'),
              version: SESSIONS_VERSIONS.V3,
            });
            const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
              id: 1234,
              sessionId: session.id,
              userId,
              isPublished: true,
              verificationCode: await generateCertificateVerificationCode(),
            });
            const assessment = databaseBuilder.factory.buildAssessment({
              userId,
              certificationCourseId: certificationCourse.id,
              type: Assessment.types.CERTIFICATION,
              state: Assessment.states.COMPLETED,
            });
            databaseBuilder.factory.buildAssessmentResult.last({
              certificationCourseId: certificationCourse.id,
              assessmentId: assessment.id,
              level: 1,
              pixScore: 23,
              emitter: 'PIX-ALGO',
              status: AssessmentResult.status.VALIDATED,
            });

            await databaseBuilder.commit();

            const server = await createServer();

            // when
            const response = await server.inject({
              method: 'GET',
              url: `/api/attestation/${certificationCourse.id}?isFrenchDomainExtension=true&lang=fr`,
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
            });

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');

            const filename = `filename=attestation-pix-20181201.pdf`;
            expect(response.headers['content-disposition']).to.include(filename);

            const fileFormat = response.result.substring(1, 4);
            expect(fileFormat).to.equal('PDF');
          });
        });
      });

      context('when session version is V2', function () {
        it('should return 200 HTTP status code and the certification', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          await _buildDatabaseCertification({ userId, certificationCourseId: 1234 });
          await databaseBuilder.commit();

          const server = await createServer();

          // when
          const response = await server.inject({
            method: 'GET',
            url: '/api/attestation/1234?isFrenchDomainExtension=true&lang=fr',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
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

  describe('GET /api/admin/sessions/{sessionId}/attestations', function () {
    describe('when the session version is V2', function () {
      it('should return 200 HTTP status code and the certification', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        await _buildDatabaseCertification({ userId: superAdmin.id, sessionId: 4567 });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/admin/sessions/4567/attestations',
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.include('filename=attestation-pix');
        expect(response.file).not.to.be.null;
      });
    });

    describe('when the session version is V3', function () {
      it('should return 200 HTTP status code and the certification', async function () {
        // given
        await featureToggles.set('isV3CertificationAttestationEnabled', true);
        const superAdmin = await insertUserWithRoleSuperAdmin();

        const sessionId = 4567;

        const { session } = await _buildDatabaseCertification({
          userId: superAdmin.id,
          sessionId,
          sessionVersion: SESSIONS_VERSIONS.V3,
        });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/admin/sessions/4567/attestations',
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.equal(
          `attachment; filename=session-${sessionId}-attestation-pix-${dayjs(session.publishedAt).format('YYYYMMDD')}.pdf`,
        );
        expect(response.file).not.to.be.null;
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/certification-attestations', function () {
    describe('when the session version is V2', function () {
      it('should return HTTP status 200 and a PDF', async function () {
        // given
        const adminIsManagingStudent = databaseBuilder.factory.buildUser.withRawPassword();

        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          organizationId: organization.id,
          userId: adminIsManagingStudent.id,
          organizationRole: Membership.roles.ADMIN,
        });

        const student = databaseBuilder.factory.buildUser.withRawPassword();
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          division: 'aDivision',
          userId: student.id,
        });

        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          organizationLearnerId: organizationLearner.id,
          userId: student.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          userId: candidate.userId,
          sessionId: candidate.sessionId,
          isPublished: true,
          isCancelled: false,
        });

        const badge = databaseBuilder.factory.buildBadge({ key: 'a badge' });

        const assessment = databaseBuilder.factory.buildAssessment({
          userId: candidate.userId,
          certificationCourseId: certificationCourse.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });

        const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourse.id,
          assessmentId: assessment.id,
          status: AssessmentResult.status.VALIDATED,
        });
        databaseBuilder.factory.buildCompetenceMark({
          level: 3,
          score: 23,
          area_code: '1',
          competence_code: '1.3',
          assessmentResultId: assessmentResult.id,
          acquiredComplementaryCertifications: [badge.key],
        });

        await databaseBuilder.commit();

        const server = await createServer();

        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/certification-attestations?division=aDivision&isFrenchDomainExtension=true&lang=fr`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: adminIsManagingStudent.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.include(`_attestations_${organizationLearner.division}`);
      });
    });

    describe('when the session version is V3', function () {
      it('should return HTTP status 200', async function () {
        // given
        await featureToggles.set('isV3CertificationAttestationEnabled', true);

        const adminIsManagingStudent = databaseBuilder.factory.buildUser.withRawPassword();

        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          organizationId: organization.id,
          userId: adminIsManagingStudent.id,
          organizationRole: Membership.roles.ADMIN,
        });

        const student = databaseBuilder.factory.buildUser.withRawPassword();
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          division: 'aDivision',
          userId: student.id,
        });

        const session = databaseBuilder.factory.buildSession({
          version: SESSIONS_VERSIONS.V3,
          publishedAt: new Date(),
        });

        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          organizationLearnerId: organizationLearner.id,
          userId: student.id,
          sessionId: session.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          userId: candidate.userId,
          sessionId: session.id,
          isPublished: true,
          isCancelled: false,
        });

        const assessment = databaseBuilder.factory.buildAssessment({
          userId: candidate.userId,
          certificationCourseId: certificationCourse.id,
          type: Assessment.types.CERTIFICATION,
          state: 'completed',
        });

        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourse.id,
          assessmentId: assessment.id,
          status: AssessmentResult.status.VALIDATED,
        });

        await databaseBuilder.commit();

        const server = await createServer();

        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/certification-attestations?division=aDivision&isFrenchDomainExtension=true&lang=fr`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: adminIsManagingStudent.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.equal(
          `attachment; filename=${organizationLearner.division.toLowerCase()}-attestation-pix-${dayjs(session.publishedAt).format('YYYYMMDD')}.pdf`,
        );
        expect(response.file).not.to.be.null;
      });
    });
  });
});

async function _buildDatabaseCertification({
  userId,
  certificationCourseId = 10,
  sessionId = 12,
  sessionVersion = SESSIONS_VERSIONS.V2,
}) {
  const session = databaseBuilder.factory.buildSession({
    id: sessionId,
    publishedAt: new Date('2018-12-01T01:02:03Z'),
    version: sessionVersion,
  });
  const badge = databaseBuilder.factory.buildBadge({ key: 'charlotte_aux_fraises' });
  const cc = databaseBuilder.factory.buildComplementaryCertification({ key: 'A' });
  const ccBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
    complementaryCertificationId: cc.id,
    badgeId: badge.id,
    imageUrl: 'http://tarte.fr/mirabelle.png',
    isTemporaryBadge: false,
    label: 'tarte à la mirabelle',
    certificateMessage: 'Miam',
    stickerUrl: 'http://tarte.fr/sticker.pdf',
  });
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    id: certificationCourseId,
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
    complementaryCertificationBadgeId: ccBadge.id,
    complementaryCertificationId: cc.id,
    name: 'patisseries au fruits',
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: id,
    complementaryCertificationBadgeId: ccBadge.id,
  });
  return { userId, session, badge, certificationCourse, assessment, assessmentResult };
}

async function _buildDatabaseForV2Certification() {
  const userId = databaseBuilder.factory.buildUser().id;
  const session = databaseBuilder.factory.buildSession({
    version: SESSIONS_VERSIONS.V2,
    publishedAt: new Date('2018-12-01T01:02:03Z'),
  });
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
