import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { types } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../src/shared/constants.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Routes | certification-candidate', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/certification-candidates/{certificationCandidateId}/authorize-to-start', function () {
    context('when user is authenticated', function () {
      context('when the user is the invigilator of the session', function () {
        it('should return a 204 status code', async function () {
          // given
          const candidateUserId = databaseBuilder.factory.buildUser({}).id;
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
          const sessionId = databaseBuilder.factory.buildSession({
            publishedAt: null,
            certificationCenterId: certificationCenter.id,
          }).id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            userId: candidateUserId,
          }).id;
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            id: 1001,
            sessionId,
            userId: candidateUserId,
          });
          databaseBuilder.factory.buildAssessment({
            state: 'started',
            userId: candidateUserId,
            type: 'CERTIFICATION',
            certificationCourseId,
          });

          const invigilatorUserId = databaseBuilder.factory.buildUser({}).id;
          databaseBuilder.factory.buildInvigilatorAccess({
            userId: invigilatorUserId,
            sessionId,
          });

          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/certification-candidates/${candidate.id}/authorize-to-start`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: invigilatorUserId, source: 'pix-certif' }),
            payload: { 'authorized-to-start': true },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('POST /api/certification-candidates/{certificationCandidateId}/authorize-to-resume', function () {
    context('when user is authenticated', function () {
      context('when the user is the invigilator of the session', function () {
        it('should return a 204 status code', async function () {
          // given
          const server = await createServer();
          const candidateUserId = databaseBuilder.factory.buildUser().id;
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
          const sessionId = databaseBuilder.factory.buildSession({
            publishedAt: null,
            certificationCenterId: certificationCenter.id,
          }).id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            userId: candidateUserId,
          }).id;
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            id: 1001,
            sessionId,
            userId: candidateUserId,
          });
          databaseBuilder.factory.buildAssessment({
            state: 'started',
            userId: candidateUserId,
            type: 'CERTIFICATION',
            certificationCourseId,
          });

          const invigilatorUserId = databaseBuilder.factory.buildUser({}).id;
          databaseBuilder.factory.buildInvigilatorAccess({
            userId: invigilatorUserId,
            sessionId,
          });

          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/certification-candidates/${candidate.id}/authorize-to-resume`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: invigilatorUserId, source: 'pix-certif' }),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('PATCH /api/certification-candidates/{certificationCandidateId}/end-assessment-by-invigilator', function () {
    context('when user is authenticated', function () {
      context('when the user is the invigilator of the session', function () {
        it('should return a 204 status code', async function () {
          // given
          const server = await createServer();
          const candidateUserId = databaseBuilder.factory.buildUser({}).id;
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
          const sessionId = databaseBuilder.factory.buildSession({
            certificationCenterId: certificationCenter.id,
          }).id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            userId: candidateUserId,
          }).id;
          databaseBuilder.factory.buildCertificationCandidate({
            id: 1001,
            sessionId,
            userId: candidateUserId,
          });
          databaseBuilder.factory.buildAssessment({
            state: 'started',
            userId: candidateUserId,
            type: 'CERTIFICATION',
            certificationCourseId,
          });
          const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
            courseId: certificationCourseId,
          });
          databaseBuilder.factory.learningContent.buildSkill({ id: 'skillId' });
          databaseBuilder.factory.learningContent.buildChallenge({
            id: certificationChallenge.challengeId,
            skillId: 'skillId',
          });

          const invigilatorUserId = databaseBuilder.factory.buildUser({}).id;
          databaseBuilder.factory.buildInvigilatorAccess({
            userId: invigilatorUserId,
            sessionId,
          });

          await databaseBuilder.commit();
          const options = {
            method: 'PATCH',
            url: `/api/certification-candidates/1001/end-assessment-by-invigilator`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: invigilatorUserId, source: 'pix-certif' }),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('POST /api/sessions/{sessionId}/candidate-participation', function () {
    let options, learningContent;
    const firstName = 'Marie';
    const lastName = 'Antoinette';
    const birthdate = '2004-12-25';

    beforeEach(async function () {
      learningContent = [
        {
          id: 'recArea0',
          competences: [
            {
              id: 'recCompetence0',
              tubes: [
                {
                  id: 'recTube0_0',
                  skills: [
                    {
                      id: 'recSkill0_0',
                      nom: '@recSkill0_0',
                      challenges: [{ id: 'recChallenge0_0_0' }],
                      level: 0,
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1_0',
                  skills: [
                    {
                      id: 'recSkill1_0',
                      nom: '@recSkill1_0',
                      challenges: [{ id: 'recChallenge1_0_0' }],
                      level: 0,
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence2',
              tubes: [
                {
                  id: 'recTube2_0',
                  skills: [
                    {
                      id: 'recSkill2_0',
                      nom: '@recSkill2_0',
                      challenges: [{ id: 'recChallenge2_0_0' }],
                      level: 0,
                    },
                    {
                      id: 'recSkill2_1',
                      nom: '@recSkill2_1',
                      challenges: [{ id: 'recChallenge2_1_0' }],
                      level: 1,
                    },
                    {
                      id: 'recSkill2_2',
                      nom: '@recSkill2_2',
                      challenges: [{ id: 'recChallenge2_2_0' }],
                      level: 2,
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence3',
              tubes: [
                {
                  id: 'recTube3_0',
                  skills: [
                    {
                      id: 'recSkill3_0',
                      nom: '@recSkill3_0',
                      challenges: [{ id: 'recChallenge3_0_0' }],
                      level: 0,
                    },
                    {
                      id: 'recSkill3_1',
                      nom: '@recSkill3_1',
                      challenges: [{ id: 'recChallenge3_1_0' }],
                      level: 1,
                    },
                    {
                      id: 'recSkill3_2',
                      nom: '@recSkill3_2',
                      challenges: [{ id: 'recChallenge3_2_0' }],
                      level: 2,
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence4',
              tubes: [
                {
                  id: 'recTube4_0',
                  skills: [
                    {
                      id: 'recSkill4_0',
                      nom: '@recSkill4_0',
                      challenges: [{ id: 'recChallenge4_0_0' }],
                      level: 0,
                    },
                    {
                      id: 'recSkill4_1',
                      nom: '@recSkill4_1',
                      challenges: [{ id: 'recChallenge4_1_0' }],
                      level: 1,
                    },
                    {
                      id: 'recSkill4_2',
                      nom: '@recSkill4_2',
                      challenges: [{ id: 'recChallenge4_2_0' }],
                      level: 2,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);
      await databaseBuilder.commit();
    });

    context('not SCO / isManagingStudents', function () {
      let sessionId, userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser({
          lang: 'fr',
        }).id;
        console.log(userId)
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          type: CERTIFICATION_CENTER_TYPES.SUP,
        }).id;
        sessionId = databaseBuilder.factory.buildSession({
          finalizedAt: null,
          version: AlgorithmEngineVersion.V3,
          certificationCenterId,
        }).id;
        databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas({
          learningContent,
          userId,
          earnedPix: 48,
        });

        options = {
          method: 'POST',
          url: `/api/sessions/${sessionId}/candidate-participation`,
          payload: {
            data: {
              type: 'certification-candidates',
              attributes: {
                'first-name': firstName,
                'last-name': lastName,
                birthdate,
              },
            },
          },
          headers: {
            ...generateAuthenticatedUserRequestHeaders({ userId }),
            origin: 'https://app.pix.fr',
          },
        };

        return databaseBuilder.commit();
      });

      it('should return a 201 status and the linked candidate when linking has been done', async function () {
        // given
        const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
          firstName,
          lastName,
          birthdate,
          sessionId,
          userId: null,
          organizationLearnerId: null,
          hasSeenCertificationInstructions: false,
        }).id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data).to.deep.equal({
          type: 'certification-candidates',
          id: certificationCandidateId.toString(),
          attributes: {
            'first-name': 'Marie',
            'last-name': 'Antoinette',
            birthdate: '2004-12-25',
            subscription: 'CORE',
            'double-certification-eligibility': false,
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
            'has-started-test': false,
          },
        });
      });

      it('should return a 200 status and the linked candidate when linking was already done', async function () {
        // given
        const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
          firstName,
          lastName,
          birthdate,
          sessionId,
          userId,
          organizationLearnerId: null,
          hasSeenCertificationInstructions: false,
        }).id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data).to.deep.equal({
          type: 'certification-candidates',
          id: certificationCandidateId.toString(),
          attributes: {
            'first-name': 'Marie',
            'last-name': 'Antoinette',
            birthdate: '2004-12-25',
            subscription: 'CORE',
            'double-certification-eligibility': false,
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
            'has-started-test': false,
          },
        });
      });
    });

    context('SCO / isManagingStudents', function () {
      let sessionId, userId, organizationLearnerId;

      beforeEach(function () {
        userId = databaseBuilder.factory.buildUser({
          lang: 'fr',
        }).id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          type: CERTIFICATION_CENTER_TYPES.SCO,
          externalId: 'ABC123',
        }).id;
        const organizationId = databaseBuilder.factory.buildOrganization({
          externalId: 'ABC123',
          type: types.SCO,
          isManagingStudents: true,
        }).id;
        organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          firstName,
          lastName,
          birthdate,
          userId,
          organizationId,
        }).id;
        sessionId = databaseBuilder.factory.buildSession({
          finalizedAt: null,
          version: AlgorithmEngineVersion.V3,
          certificationCenterId,
        }).id;
        databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas({
          learningContent,
          userId,
          earnedPix: 48,
        });

        options = {
          method: 'POST',
          url: `/api/sessions/${sessionId}/candidate-participation`,
          payload: {
            data: {
              type: 'certification-candidates',
              attributes: {
                'first-name': firstName,
                'last-name': lastName,
                birthdate,
              },
            },
          },
          headers: {
            ...generateAuthenticatedUserRequestHeaders({ userId }),
            origin: 'https://app.pix.org',
          },
        };

        return databaseBuilder.commit();
      });

      it('should return a 201 status and the linked candidate when linking has been done', async function () {
        // given
        const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
          firstName,
          lastName,
          birthdate,
          sessionId,
          userId: null,
          organizationLearnerId,
          hasSeenCertificationInstructions: false,
        }).id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data).to.deep.equal({
          type: 'certification-candidates',
          id: certificationCandidateId.toString(),
          attributes: {
            'first-name': 'Marie',
            'last-name': 'Antoinette',
            birthdate: '2004-12-25',
            subscription: 'CORE',
            'double-certification-eligibility': false,
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
            'has-started-test': false,
          },
        });
      });

      it.only('should return a 200 status and the linked candidate when linking was already done', async function () {
        // given
        const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
          firstName,
          lastName,
          birthdate,
          sessionId,
          userId,
          organizationLearnerId,
          hasSeenCertificationInstructions: false,
        }).id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data).to.deep.equal({
          type: 'certification-candidates',
          id: certificationCandidateId.toString(),
          attributes: {
            'first-name': 'Marie',
            'last-name': 'Antoinette',
            birthdate: '2004-12-25',
            subscription: 'CORE',
            'double-certification-eligibility': false,
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
            'has-started-test': false,
          },
        });
      });
    });
  });
});
