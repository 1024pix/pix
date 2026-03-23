import dayjs from 'dayjs';

import { Frameworks } from '../../../../../src/certification/configuration/domain/models/Frameworks.js';
import { generateCertificateVerificationCode } from '../../../../../src/certification/evaluation/domain/services/verify-certificate-code-service.js';
import {
  CERTIFICATE_STATUSES,
  CERTIFICATE_TYPES,
  EXTRA_CERTIFICATE_STATUSES,
} from '../../../../../src/certification/results/domain/models/CertificateSummary.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import * as AssesmentResult from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
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

  beforeEach(async function () {
    const learningContent = [
      {
        id: 'recvoGdo7z2z7pXWa',
        frameworkId: 'Pix',
        code: '1',
        name: '1. Information et données',
        title_i18n: { fr: 'Information et données' },
        color: 'jaffa',
        competences: [
          {
            id: 'Pix',
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
            frameworkId: 'Pix',
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
            frameworkId: 'Pix',
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
      {
        id: 'recoB4JYOBS1PCxhh',
        frameworkId: 'Pix',
        code: '2',
        name: '2. Communication et collaboration',
        competences: [
          {
            id: 'recDH19F7kKrfL3Ii',
            name_i18n: { fr: 'Interagir' },
            index: '2.1',
          },
          {
            id: 'recgxqQfz3BqEbtzh',
            name_i18n: { fr: 'Partager et publier' },
            index: '2.2',
          },
          {
            id: 'recMiZPNl7V1hyE1d',
            name_i18n: { fr: 'Collaborer' },
            index: '2.3',
          },
          {
            id: 'recFpYXCKcyhLI3Nu',
            name_i18n: { fr: "S'insérer" },
            index: '2.4',
          },
        ],
      },
      {
        id: 'recOdC9UDVJbAXHAm',
        frameworkId: 'Pix',
        code: '3',
        name: '3. Création de contenu',
        competences: [
          {
            id: 'recOdC9UDVJbAXHAm',
            name_i18n: { fr: 'Dev des docs' },
            index: '3.1',
          },
          {
            id: 'recbDTF8KwupqkeZ6',
            name_i18n: { fr: 'Dev des docs mult' },
            index: '3.2',
          },
          {
            id: 'recHmIWG6D0huq6Kx',
            name_i18n: { fr: 'Adapt' },
            index: '3.3',
          },
          {
            id: 'rece6jYwH4WEw549z',
            name_i18n: { fr: 'Programmer' },
            index: '3.4',
          },
        ],
      },
      {
        id: 'recUcSnS2lsOhFIeE',
        frameworkId: 'Pix',
        code: '4',
        name: '4. Protection et sécurité',
        competences: [
          {
            id: 'rec6rHqas39zvLZep',
            name_i18n: { fr: 'Dev des docs' },
            index: '4.1',
          },
          {
            id: 'recofJCxg0NqTqTdP',
            name_i18n: { fr: 'Dev des docs mult' },
            index: '4.2',
          },
          {
            id: 'recfr0ax8XrfvJ3ER',
            name_i18n: { fr: 'Adapt' },
            index: '4.3',
          },
        ],
      },
      {
        id: 'recnrCmBiPXGbgIyQ',
        frameworkId: 'Pix',
        code: '5',
        name: '5. Environnement numérique',
        competences: [
          {
            id: 'recIhdrmCuEmCDAzj',
            name_i18n: { fr: 'Dev des docs' },
            index: '5.1',
          },
          {
            id: 'recudHE5Omrr10qrx',
            name_i18n: { fr: 'Dev des docs mult' },
            index: '5.2',
          },
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);
  });

  describe('GET /api/certifications/{certificationCourseId}', function () {
    it('should return 200 HTTP status code and the certification with the result competence tree included', async function () {
      // given
      server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      ({ session, badge, certificationCourse, assessmentResult } = await _buildDatabaseForV2Certification({ userId }));
      databaseBuilder.factory.buildCompetenceMark({
        level: 3,
        score: 23,
        area_code: '1',
        competence_code: '1.1',
        assessmentResultId: assessmentResult.id,
        acquiredComplementaryCertifications: [badge.key],
      });
      await databaseBuilder.commit();

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
            'algorithm-engine-version': AlgorithmEngineVersion.V2,
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
                stickerUrl: 'http://example.net/stickers/macaron_pixclea.pdf',
                message: 'Miam',
              },
            ],
            'verification-code': certificationCourse.verificationCode,
            'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
            version: AlgorithmEngineVersion.V2,
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
            id: 'Pix',
            type: 'result-competences',
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
                  {
                    id: 'recoB4JYOBS1PCxhh',
                    type: 'areas',
                  },
                  {
                    id: 'recOdC9UDVJbAXHAm',
                    type: 'areas',
                  },
                  {
                    id: 'recUcSnS2lsOhFIeE',
                    type: 'areas',
                  },
                  {
                    id: 'recnrCmBiPXGbgIyQ',
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
      expect(response.result.data).to.deep.equal(expectedBody.data);
      expect(response.result.included[0]).to.deep.equal(expectedBody.included[0]);
      expect(response.result.included[21]).to.deep.equal(expectedBody.included[1]);
    });
  });

  describe('GET /api/certifications', function () {
    context('when certification is v2', function () {
      beforeEach(async function () {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        ({ session, certificationCourse, assessment, assessmentResult } = await _buildDatabaseForV2Certification({
          userId,
        }));

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
              'algorithm-engine-version': AlgorithmEngineVersion.V2,
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
              version: AlgorithmEngineVersion.V2,
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
          version: AlgorithmEngineVersion.V3,
        });
        certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          isPublished: true,
          maxReachableLevelOnCertificationDate: 3,
          verificationCode: await generateCertificateVerificationCode(),
          version: AlgorithmEngineVersion.V3,
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
              'algorithm-engine-version': AlgorithmEngineVersion.V3,
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
              version: AlgorithmEngineVersion.V3,
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

  describe('GET /api/certificate-summaries', function () {
    let certificationCenterId;
    beforeEach(async function () {
      server = await createServer();
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'SunnydaleHigh' }).id;
    });

    context('when user is not authenticated', function () {
      it('should return 401 HTTP status code', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/certificate-summaries',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user is authenticated', function () {
      it('should return 200 HTTP status code along with all the user certifications', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          certificationCenter: 'SunnydaleHigh',
        }).id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId: sessionId,
          isPublished: true,
          framework: Frameworks.CORE,
          verificationCode: 'ABC123',
          createdAt: new Date('2025-05-05'),
          userId,
          version: AlgorithmEngineVersion.V3,
        }).id;
        const lastAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({
          pixScore: 777,
          status: AssesmentResult.status.VALIDATED,
          commentForCandidate: 'COUCOU C MOI',
        }).id;
        databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
          certificationCourseId,
          lastAssessmentResultId,
        });

        const eduSessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          certificationCenter: 'SunnydaleHigh',
        }).id;
        const eduCertificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId: eduSessionId,
          isPublished: true,
          framework: Frameworks.EDU_1ER_DEGRE,
          verificationCode: 'DEF456',
          createdAt: new Date('2025-06-06'),
          userId,
          version: AlgorithmEngineVersion.V2,
        }).id;
        const eduLastAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({
          pixScore: null,
          status: AssesmentResult.status.VALIDATED,
          reachedMeshIndex: 1,
          commentForCandidate: 'Bravo',
        }).id;
        databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
          certificationCourseId: eduCertificationCourseId,
          lastAssessmentResultId: eduLastAssessmentResultId,
        });
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          key: 'EDU_1ER_DEGRE',
        });
        const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: complementaryCertification.id,
          badgeId: databaseBuilder.factory.buildBadge({ key: 'pix_edu_1er_degre' }).id,
        });
        const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
          certificationCourseId: eduCertificationCourseId,
          complementaryCertificationId: complementaryCertification.id,
          complementaryCertificationBadgeId: complementaryCertificationBadge.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: complementaryCertificationCourse.id,
          complementaryCertificationBadgeId: complementaryCertificationBadge.id,
          acquired: false,
        });

        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: '/api/certificate-summaries',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal([
          {
            type: 'certificate-summaries',
            id: `${certificationCourseId}`,
            attributes: {
              'verification-code': 'ABC123',
              'certification-center-name': 'SunnydaleHigh',
              'certification-framework': Frameworks.CORE,
              'certification-started-at': new Date('2025-05-05'),
              comment: 'COUCOU C MOI',
              'pix-score': 777,
              'certificate-type': CERTIFICATE_TYPES.CERTIFICATE,
              status: CERTIFICATE_STATUSES.VALIDATED,
              'extra-certification-status': EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
              'reached-mesh-index': null,
            },
          },
          {
            type: 'certificate-summaries',
            id: `${eduCertificationCourseId}`,
            attributes: {
              'verification-code': 'DEF456',
              'certification-center-name': 'SunnydaleHigh',
              'certification-framework': Frameworks.EDU_1ER_DEGRE,
              'certification-started-at': new Date('2025-06-06'),
              comment: 'Bravo',
              'certificate-type': CERTIFICATE_TYPES.ATTESTATION,
              'pix-score': null,
              status: CERTIFICATE_STATUSES.VALIDATED,
              'extra-certification-status': EXTRA_CERTIFICATE_STATUSES.NOT_ACQUIRED,
              'reached-mesh-index': 1,
            },
          },
        ]);
      });
    });
  });

  describe('POST /api/shared-certifications', function () {
    beforeEach(async function () {
      server = await createServer();

      const userId = databaseBuilder.factory.buildUser().id;
      ({ session, badge, certificationCourse, assessmentResult } = await _buildDatabaseForV2Certification({ userId }));
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
                  stickerUrl: 'http://example.net/stickers/macaron_pixclea.pdf',
                  message: 'Miam',
                },
              ],
              'max-reachable-level-on-certification-date': certificationCourse.maxReachableLevelOnCertificationDate,
              version: session.version,
              'acquired-complementary-certification': undefined,
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
                    {
                      id: 'recoB4JYOBS1PCxhh',
                      type: 'areas',
                    },
                    {
                      id: 'recOdC9UDVJbAXHAm',
                      type: 'areas',
                    },
                    {
                      id: 'recUcSnS2lsOhFIeE',
                      type: 'areas',
                    },
                    {
                      id: 'recnrCmBiPXGbgIyQ',
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
        expect(response.result.data).to.deep.equal(expectedBody.data);
        expect(response.result.included[21]).to.deep.equal(expectedBody.included[1]);
      });
    });

    context('when the given verificationCode is incorrect', function () {
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
        it('should return 200 HTTP status code and the certification', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;

          const session = databaseBuilder.factory.buildSession({
            id: 123,
            publishedAt: new Date('2018-12-01T01:02:03Z'),
            version: AlgorithmEngineVersion.V3,
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

          const filename = `filename=certification-pix-20181201.pdf`;
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
        const { certificationCourse } = await _buildDatabaseForV2Certification({ userId });
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
        expect(response.headers['content-disposition']).to.include('filename=certification-pix');
        expect(response.file).not.to.be.null;
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/certification-attestations', function () {
    context('when the session version is V2', function () {
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
        });

        databaseBuilder.factory.buildBadge({ key: 'a badge' });

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

    context('when the session version is V3', function () {
      it('should return HTTP status 200', async function () {
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

        const session = databaseBuilder.factory.buildSession({
          version: AlgorithmEngineVersion.V3,
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
          `attachment; filename=${organizationLearner.division.toLowerCase()}-certification-pix-${dayjs(session.publishedAt).format('YYYYMMDD')}.pdf`,
        );
        expect(response.file).not.to.be.null;
      });
    });
  });

  describe('GET /api/admin/sessions/{sessionId}/attestations', function () {
    context('when the session version is V2', function () {
      it('should return 200 HTTP status code and the certification', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const { session } = await _buildDatabaseForV2Certification({ userId: superAdmin.id });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/sessions/${session.id}/attestations`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.equal(
          `attachment; filename=session-${session.id}-certification-pix-${dayjs(session.publishedAt).format('YYYYMMDD')}.pdf`,
        );
        expect(response.file).not.to.be.null;
      });
    });

    context('when the session version is V3', function () {
      it('should return 200 HTTP status code and the certification', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const { session, userId } = await _buildDatabaseForV2Certification({ userId: superAdmin.id });
        await databaseBuilder.commit();

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/sessions/${session.id}/attestations`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/pdf');
        expect(response.headers['content-disposition']).to.equal(
          `attachment; filename=session-${session.id}-certification-pix-${dayjs(session.publishedAt).format('YYYYMMDD')}.pdf`,
        );
        expect(response.file).not.to.be.null;
      });
    });
  });
});

async function _buildDatabaseForV2Certification({ userId }) {
  const session = databaseBuilder.factory.buildSession({
    version: AlgorithmEngineVersion.V2,
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
    stickerUrl: 'http://example.net/stickers/macaron_pixclea.pdf',
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
  return { session, badge, certificationCourse, assessment, assessmentResult };
}
