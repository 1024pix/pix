import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { types } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Certification | Enrolment | Acceptance | Routes | session-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /certification-centers/{certificationCenterId}/session', function () {
    let options;

    beforeEach(function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Tour Gamma' }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      options = {
        method: 'POST',
        url: `/api/certification-centers/${certificationCenterId}/session`,
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center-id': certificationCenterId,
              address: 'Nice',
              date: '2017-12-08',
              description: '',
              examiner: 'Michel Essentiel',
              room: '28D',
              time: '14:30',
            },
          },
        },
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
      return databaseBuilder.commit();
    });

    it('should return an OK status after saving in database', async function () {
      // when
      const response = await server.inject(options);

      // then
      const sessions = await knex('sessions').select();
      expect(response.statusCode).to.equal(200);
      expect(sessions).to.have.lengthOf(1);
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('PATCH /api/sessions/{sessionId}', function () {
    let user, unauthorizedUser, certificationCenter, session, payload;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      unauthorizedUser = databaseBuilder.factory.buildUser();
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user.id,
        certificationCenterId: certificationCenter.id,
      });
      session = databaseBuilder.factory.buildSession({
        certificationCenter: certificationCenter.name,
        certificationCenterId: certificationCenter.id,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12',
      });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
      });
      payload = {
        data: {
          id: session.id,
          type: 'sessions',
          attributes: {
            address: 'New address',
            room: 'New room',
            examiner: 'Antoine Toutvenant',
            date: '2017-08-12',
            time: '14:30',
            description: 'ahah',
            accessCode: 'ABCD12',
          },
        },
      };

      await databaseBuilder.commit();
    });

    it('should respond with a 200 and update the session', function () {
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${session.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('session-enrolments');
        expect(response.result.data.id).to.equal(session.id.toString());
        expect(response.result.data.attributes.address).to.equal('New address');
        expect(response.result.data.attributes.room).to.equal('New room');
      });
    });

    it('should respond with a 404 when user is not authorized to update the session (to keep opacity on whether forbidden or not found)', function () {
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${session.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: unauthorizedUser.id }),
        payload,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('DELETE /sessions/{sessionId}', function () {
    it('should respond with 204', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;

      const { id: certificationCenterId, name: certificationCenter } =
        databaseBuilder.factory.buildCertificationCenter();

      const sessionId = databaseBuilder.factory.buildSession({
        certificationCenterId,
        certificationCenter,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      await databaseBuilder.commit();
      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'DELETE',
        url: `/api/sessions/${sessionId}`,
      };

      // when
      const response = await server.inject(options);

      // then

      const session = await knex('sessions').where({ id: sessionId }).first();

      expect(response.statusCode).to.equal(204);
      expect(session).to.be.undefined;
    });
  });

  describe('GET /sessions/{sessionId}', function () {
    it('should respond with 200', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;

      const { id: certificationCenterId, name: certificationCenter } =
        databaseBuilder.factory.buildCertificationCenter();

      const sessionId = databaseBuilder.factory.buildSession({
        certificationCenterId,
        certificationCenter,
      }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      await databaseBuilder.commit();
      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/sessions/${sessionId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(sessionId + '');
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
      await mockLearningContent(learningContentObjects);
    });

    context('not SCO / isManagingStudents', function () {
      let sessionId, userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser({
          lang: 'fr',
        }).id;
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
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId,
        });
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
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
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
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId,
        });
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
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
          },
        });
      });

      context('when eligibility checks fail for a v3 certification', function () {
        it('should throw a CERTIFICATION_CANDIDATE_ELIGIBILITY_ERROR', async function () {
          // given
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
            type: CERTIFICATION_CENTER_TYPES.SUP,
          }).id;

          const onlyComplementarySubscriptionUserId = databaseBuilder.factory.buildUser({
            lang: 'fr',
          }).id;

          const sessionId2 = databaseBuilder.factory.buildSession({
            id: 1234,
            finalizedAt: null,
            version: AlgorithmEngineVersion.V3,
            certificationCenterId,
          }).id;
          const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
            firstName,
            lastName,
            birthdate,
            sessionId: sessionId2,
            userId: null,
            organizationLearnerId: null,
            hasSeenCertificationInstructions: false,
          }).id;

          const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;

          databaseBuilder.factory.buildComplementaryCertificationSubscription({
            certificationCandidateId,
            complementaryCertificationId,
          });

          await databaseBuilder.commit();

          const options = {
            method: 'POST',
            url: `/api/sessions/${sessionId2}/candidate-participation`,
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
            headers: generateAuthenticatedUserRequestHeaders({ userId: onlyComplementarySubscriptionUserId }),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors[0].code).to.equal('CERTIFICATION_CANDIDATE_ELIGIBILITY_ERROR');
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
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId,
        });
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
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
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
          organizationLearnerId,
          hasSeenCertificationInstructions: false,
        }).id;
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId,
        });
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
            'session-id': sessionId,
            'has-seen-certification-instructions': false,
          },
        });
      });
    });
  });
});
