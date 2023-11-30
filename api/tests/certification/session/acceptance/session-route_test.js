import {
  expect,
  knex,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { AnswerStatus, CertificationResult } from '../../../../lib/domain/models/index.js';

describe('Acceptance | Controller | Session | session-route', function () {
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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

  describe('PATCH /api/sessions/{id}', function () {
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
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('sessions');
        expect(response.result.data.id).to.equal(session.id.toString());
        expect(response.result.data.attributes.address).to.equal('New address');
        expect(response.result.data.attributes.room).to.equal('New room');
      });
    });

    it('should respond with a 404 when user is not authorized to update the session (to keep opacity on whether forbidden or not found)', function () {
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${session.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(unauthorizedUser.id) },
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

  describe('PUT /sessions/{id}/finalization', function () {
    let options;
    let session;
    const examinerGlobalComment = 'It was a fine session my dear';

    beforeEach(async function () {
      session = databaseBuilder.factory.buildSession();
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId: session.id }).id;
      const report1 = databaseBuilder.factory.buildCertificationReport({
        sessionId: session.id,
        certificationCourseId,
      });
      const report2 = databaseBuilder.factory.buildCertificationReport({
        sessionId: session.id,
        certificationCourseId,
      });
      databaseBuilder.factory.buildAssessment({ certificationCourseId });
      options = {
        method: 'PUT',
        payload: {
          data: {
            attributes: {
              'examiner-global-comment': examinerGlobalComment,
              'has-incident': true,
              'has-joining-issue': true,
            },
            included: [
              {
                id: report1.id,
                type: 'certification-reports',
                attributes: {
                  'certification-course-id': report1.certificationCourseId,
                  'examiner-comment': 'What a fine lad this one',
                  'has-seen-end-test-screen': false,
                  'is-completed': true,
                },
              },
              {
                id: report2.id,
                type: 'certification-reports',
                attributes: {
                  'certification-course-id': report2.certificationCourseId,
                  'examiner-comment': 'What a fine lad this two',
                  'has-seen-end-test-screen': true,
                  'is-completed': true,
                },
              },
            ],
          },
        },
        headers: {},
        url: `/api/sessions/${session.id}/finalization`,
      };

      return databaseBuilder.commit();
    });

    describe('Resource access management', function () {
      it('should respond with a 401 Forbidden if the user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 404 NotFound the if user is not authorized (to keep opacity on whether forbidden or not found)', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    describe('Success case', function () {
      it('should update session', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: session.certificationCenterId,
        });

        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        await server.inject(options);

        // then
        const finalizedSession = await knex.from('sessions').where({ id: session.id }).first();
        expect(finalizedSession.hasIncident).to.be.true;
        expect(finalizedSession.hasJoiningIssue).to.be.true;
      });

      it('should neutralize auto-neutralizable challenges', async function () {
        // given
        const learningContent = [
          {
            id: 'recArea0',
            code: '66',
            competences: [
              {
                id: 'recCompetence0',
                index: '1',
                tubes: [
                  {
                    id: 'recTube0_0',
                    skills: [
                      {
                        id: 'recSkill0_0',
                        nom: '@recSkill0_0',
                        challenges: [{ id: 'recChallenge0_0_0' }, { id: 'recChallenge0_0_1' }],
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

        const userId = databaseBuilder.factory.buildUser().id;
        const session = databaseBuilder.factory.buildSession();
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId: session.id }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: session.certificationCenterId,
        });
        const report = databaseBuilder.factory.buildCertificationReport({
          certificationCourseId,
          sessionId: session.id,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
        databaseBuilder.factory.buildCertificationIssueReport({
          certificationCourseId,
          category: CertificationIssueReportCategory.IN_CHALLENGE,
          description: '',
          subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
          questionNumber: 1,
        });

        const certificationChallengeKo = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourseId,
          isNeutralized: false,
          challengeId: 'recChallenge0_0_1',
          competenceId: 'recCompetence0',
          associatedSkillName: '@recSkill0_0',
          associatedSkillId: 'recSkill0_0',
        });

        const certificationChallengeOk = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourseId,
          isNeutralized: false,
          challengeId: 'recChallenge0_0_0',
          competenceId: 'recCompetence0',
          associatedSkillName: '@recSkill0_0',
          associatedSkillId: 'recSkill0_0',
        });

        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: certificationChallengeKo.challengeId,
          result: AnswerStatus.KO.status,
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: certificationChallengeOk.challengeId,
          result: AnswerStatus.OK.status,
        });

        await databaseBuilder.commit();

        options = {
          method: 'PUT',
          payload: {
            data: {
              attributes: {
                'examiner-global-comment': examinerGlobalComment,
                'has-incident': true,
                'has-joining-issue': true,
              },
              included: [
                {
                  id: report.id,
                  type: 'certification-reports',
                  attributes: {
                    'certification-course-id': report.certificationCourseId,
                    'examiner-comment': 'What a fine lad this one',
                    'has-seen-end-test-screen': false,
                    'is-completed': true,
                  },
                },
              ],
            },
          },
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          url: `/api/sessions/${session.id}/finalization`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const actualKoCertificationChallenge = await knex('certification-challenges')
          .where({ id: certificationChallengeKo.id })
          .first();
        const actualOkCertificationChallenge = await knex('certification-challenges')
          .where({ id: certificationChallengeOk.id })
          .first();
        expect(actualKoCertificationChallenge.isNeutralized).to.be.true;
        expect(actualOkCertificationChallenge.isNeutralized).to.be.false;
      });

      it('should set the finalized session as publishable when the issue reports have been resolved', async function () {
        // given
        const learningContent = [
          {
            id: 'recArea0',
            code: '66',
            competences: [
              {
                id: 'recCompetence0',
                index: '1',
                tubes: [
                  {
                    id: 'recTube0_0',
                    skills: [
                      {
                        id: 'recSkill0_0',
                        nom: '@recSkill0_0',
                        challenges: [{ id: 'recChallenge0_0_0' }],
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

        const userId = databaseBuilder.factory.buildUser().id;
        const session = databaseBuilder.factory.buildSession();
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          completedAt: new Date(),
        }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: session.certificationCenterId,
        });
        const report = databaseBuilder.factory.buildCertificationReport({
          certificationCourseId,
          sessionId: session.id,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
        databaseBuilder.factory.buildCertificationIssueReport({
          certificationCourseId,
          category: CertificationIssueReportCategory.IN_CHALLENGE,
          description: '',
          subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
          questionNumber: 1,
        });

        databaseBuilder.factory.buildAssessmentResult({ assessmentId });

        const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourseId,
          isNeutralized: false,
          challengeId: 'recChallenge0_0_0',
          competenceId: 'recCompetence0',
          associatedSkillName: '@recSkill0_0',
          associatedSkillId: 'recSkill0_0',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: certificationChallenge.challengeId,
          result: AnswerStatus.KO.status,
        });

        await databaseBuilder.commit();

        options = {
          method: 'PUT',
          payload: {
            data: {
              attributes: {
                'examiner-global-comment': '',
                'has-incident': true,
                'has-joining-issue': true,
              },
              included: [
                {
                  id: report.id,
                  type: 'certification-reports',
                  attributes: {
                    'certification-course-id': report.certificationCourseId,
                    'examiner-comment': 'What a fine lad this one',
                    'has-seen-end-test-screen': true,
                    'is-completed': true,
                  },
                },
              ],
            },
          },
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          url: `/api/sessions/${session.id}/finalization`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const finalizedSession = await knex('finalized-sessions').where({ sessionId: session.id }).first();
        expect(finalizedSession.isPublishable).to.be.true;
      });

      it('should re score assessment when there is auto-neutralizable challenge', async function () {
        // given

        const learningContent = [
          {
            id: 'recArea0',
            code: '66',
            competences: [
              {
                id: 'recCompetence0',
                index: '1',
                tubes: [
                  {
                    id: 'recTube0_0',
                    skills: [
                      {
                        id: 'recSkill0_0',
                        nom: '@recSkill0_0',
                        challenges: [{ id: 'recChallenge0_0_0' }],
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

        const userId = databaseBuilder.factory.buildUser().id;
        const session = databaseBuilder.factory.buildSession();
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          createdAt: new Date(),
        }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: session.certificationCenterId,
        });

        const report = databaseBuilder.factory.buildCertificationReport({
          certificationCourseId,
          sessionId: session.id,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId, userId }).id;
        databaseBuilder.factory.buildCertificationIssueReport({
          certificationCourseId,
          category: CertificationIssueReportCategory.IN_CHALLENGE,
          description: '',
          subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
          questionNumber: 1,
        });

        const assessmentResultKo = databaseBuilder.factory.buildAssessmentResult({
          assessmentId,
          pixScore: 42,
        });

        databaseBuilder.factory.buildCompetenceMark({
          assessmentResultId: assessmentResultKo.id,
          competenceId: 'recCompetence0',
        });

        const certificationChallengeKo = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourseId,
          isNeutralized: false,
          challengeId: 'recChallenge0_0_0',
          competenceId: 'recCompetence0',
        });

        const answerId = databaseBuilder.factory.buildAnswer({
          assessmentId,
          challengeId: certificationChallengeKo.challengeId,
          result: AnswerStatus.KO.status,
        }).id;

        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId,
          answerId,
          skillId: 'recSkill0_0',
          competenceId: 'recCompetence0',
          userId,
          earnedPix: 16,
        });

        await databaseBuilder.commit();

        options = {
          method: 'PUT',
          payload: {
            data: {
              attributes: {
                'examiner-global-comment': examinerGlobalComment,
                'has-incident': true,
                'has-joining-issue': true,
              },
              included: [
                {
                  id: report.id,
                  type: 'certification-reports',
                  attributes: {
                    'certification-course-id': report.certificationCourseId,
                    'examiner-comment': 'What a fine lad this one',
                    'has-seen-end-test-screen': false,
                    'is-completed': true,
                  },
                },
              ],
            },
          },
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          url: `/api/sessions/${session.id}/finalization`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const actualKoAssessmentResult = await knex('assessment-results')
          .where({ assessmentId, emitter: CertificationResult.emitters.PIX_ALGO_AUTO_JURY })
          .first();
        expect(actualKoAssessmentResult.pixScore).not.to.equal(assessmentResultKo.pixScore);
      });
    });
  });

  describe('DELETE /sessions/{id}', function () {
    it('should respond with 204', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;

      const { id: certificationCenterId, name: certificationCenter } =
        databaseBuilder.factory.buildCertificationCenter();

      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, certificationCenter }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      await databaseBuilder.commit();
      const options = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
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
});
