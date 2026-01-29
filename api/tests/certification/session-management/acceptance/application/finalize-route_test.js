import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

const examinerGlobalComment = 'It was a fine session my dear';

describe('Certification | Session Management | Acceptance | Application | Route | finalize', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT api/sessions/{sessionId}/finalization', function () {
    let options;
    let session;

    describe('Resource access management', function () {
      beforeEach(async function () {
        ({ options, session } = await _createSession());
      });

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
        options.headers = generateAuthenticatedUserRequestHeaders({ userId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    describe('Success case', function () {
      context('when session is v2', function () {
        beforeEach(async function () {
          ({ options, session } = await _createSession());
        });

        it('should update session', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId,
            certificationCenterId: session.certificationCenterId,
          });

          await databaseBuilder.commit();
          options.headers = generateAuthenticatedUserRequestHeaders({ userId });

          // when
          const response = await server.inject(options);
          expect(response.statusCode).to.equal(200);

          //const finalizedSession = await knex.from('sessions').where({ id: session.id }).first();
          //expect(finalizedSession.hasIncident).to.be.true;

          setTimeout(async function () {
            // then
            const finalizedSession = await knex.from('sessions').where({ id: session.id }).first();
            expect(finalizedSession.hasIncident).to.be.true;
            expect(finalizedSession.hasJoiningIssue).to.be.true;
          }, 0);
        });

        it('should neutralize auto-neutralizable challenges', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const session = databaseBuilder.factory.buildSession();
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            sessionId: session.id,
          }).id;
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            sessionId: session.id,
            userId,
            reconciledAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

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
                      'is-completed': true,
                    },
                  },
                ],
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
          const userId = databaseBuilder.factory.buildUser().id;
          const session = databaseBuilder.factory.buildSession();
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            sessionId: session.id,
            completedAt: new Date(),
          }).id;
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            sessionId: session.id,
            userId,
            reconciledAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
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
            resolvedAt: new Date(),
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
                      'is-completed': true,
                    },
                  },
                ],
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
          const userId = databaseBuilder.factory.buildUser().id;
          const session = databaseBuilder.factory.buildSession();
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            userId,
            createdAt: new Date(),
          }).id;
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            sessionId: session.id,
            userId,
            reconciledAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
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
                      'is-completed': true,
                    },
                  },
                ],
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            url: `/api/sessions/${session.id}/finalization`,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const actualKoAssessmentResult = await knex('assessment-results')
            .where({ assessmentId })
            .orderBy('createdAt', 'desc')
            .first();
          expect(actualKoAssessmentResult.pixScore).not.to.equal(assessmentResultKo.pixScore);
        });
      });

      context('when session is v3', function () {
        beforeEach(async function () {
          ({ options, session } = await _createSession({ version: 3 }));
          databaseBuilder.factory.buildCertificationVersion();
          await databaseBuilder.commit();
        });

        it('should update session', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId,
            certificationCenterId: session.certificationCenterId,
          });

          await databaseBuilder.commit();
          options.headers = generateAuthenticatedUserRequestHeaders({ userId });

          // when
          await server.inject(options);

          // then
          const finalizedSession = await knex.from('sessions').where({ id: session.id }).first();
          expect(finalizedSession.hasIncident).to.be.true;
          expect(finalizedSession.hasJoiningIssue).to.be.true;
        });

        it('should set the finalized session as publishable', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const session = databaseBuilder.factory.buildSession({ version: AlgorithmEngineVersion.V3 });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            sessionId: session.id,
            completedAt: new Date(),
            version: AlgorithmEngineVersion.V3,
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
            subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
            questionNumber: 1,
          });

          const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
            assessmentId,
            certificationCourseId,
          });
          databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
            lastAssessmentResultId: assessmentResult.id,
            certificationCourseId,
          });

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
                      'is-completed': true,
                    },
                  },
                ],
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            url: `/api/sessions/${session.id}/finalization`,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const finalizedSession = await knex('finalized-sessions').where({ sessionId: session.id }).first();
          expect(finalizedSession.isPublishable).to.be.true;
        });

        it('should mark the assessment as ended due to finalization', async function () {
          // given
          const abortReason = 'candidate';
          const userId = databaseBuilder.factory.buildUser().id;
          const session = databaseBuilder.factory.buildSession({ version: AlgorithmEngineVersion.V3 });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            userId,
            sessionId: session.id,
            completedAt: null,
            version: AlgorithmEngineVersion.V3,
          }).id;
          databaseBuilder.factory.buildCertificationCandidate({
            sessionId: session.id,
            userId,
            reconciledAt: new Date('2020-01-01'),
          });
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId,
            certificationCenterId: session.certificationCenterId,
          });
          const report = databaseBuilder.factory.buildCertificationReport({
            certificationCourseId,
            sessionId: session.id,
          });

          const assessmentId = databaseBuilder.factory.buildAssessment({
            certificationCourseId,
            state: Assessment.states.STARTED,
          }).id;
          databaseBuilder.factory.buildCertificationIssueReport({
            certificationCourseId,
            category: CertificationIssueReportCategory.IN_CHALLENGE,
            description: '',
            subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
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
                      'is-completed': true,
                      'abort-reason': abortReason,
                    },
                  },
                ],
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            url: `/api/sessions/${session.id}/finalization`,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const assessment = await knex('assessments').where({ certificationCourseId }).first();
          expect(assessment.state).to.equal('endedDueToFinalization');
        });

        context('when certification is a double certification', function () {
          it('should acquire the double certification', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;

            const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea({});

            const badgeId = databaseBuilder.factory.buildBadge({ isCertifiable: true }).id;
            const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
              badgeId,
              complementaryCertificationId: cleaComplementaryCertification.id,
            }).id;

            databaseBuilder.factory.buildBadgeAcquisition({
              userId,
              badgeId,
              createdAt: new Date('2020-01-01'),
            });

            const session = databaseBuilder.factory.buildSession({ version: AlgorithmEngineVersion.V3 });
            databaseBuilder.factory.buildCertificationCandidate({
              userId,
              sessionId: session.id,
            });
            const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
              userId,
              sessionId: session.id,
              completedAt: new Date(),
              version: AlgorithmEngineVersion.V3,
            }).id;

            const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
              certificationCourseId,
              complementaryCertificationBadgeId,
              complementaryCertificationId: cleaComplementaryCertification.id,
            }).id;

            databaseBuilder.factory.buildCertificationCenterMembership({
              userId,
              certificationCenterId: session.certificationCenterId,
            });

            const assessmentId = databaseBuilder.factory.buildAssessment({
              certificationCourseId,
              state: Assessment.states.STARTED,
              type: Assessment.types.CERTIFICATION,
            }).id;

            const report = databaseBuilder.factory.buildCertificationReport({
              certificationCourseId,
              sessionId: session.id,
            });
            databaseBuilder.factory.buildCertificationIssueReport({
              certificationCourseId,
              category: CertificationIssueReportCategory.IN_CHALLENGE,
              description: '',
              subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
              questionNumber: 1,
            });

            const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
              courseId: certificationCourseId,
              isNeutralized: false,
              challengeId: 'recChallenge0_0_0',
              competenceId: 'recCompetence0',
              associatedSkillName: '@recSkill0_0',
              associatedSkillId: 'recSkill0_0',
              difficulty: 1,
              discriminant: 2,
            });
            databaseBuilder.factory.buildAnswer({
              assessmentId,
              challengeId: certificationChallenge.challengeId,
              result: AnswerStatus.OK.status,
            });

            await databaseBuilder.commit();

            options = {
              method: 'PUT',
              payload: {
                data: {
                  attributes: {
                    'examiner-global-comment': '',
                    'has-incident': false,
                    'has-joining-issue': false,
                  },
                  included: [
                    {
                      id: report.id,
                      type: 'certification-reports',
                      attributes: {
                        'certification-course-id': report.certificationCourseId,
                        'examiner-comment': 'What a fine lad this one',
                        'is-completed': true,
                        'abort-reason': 'candidate',
                      },
                    },
                  ],
                },
              },
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
              url: `/api/sessions/${session.id}/finalization`,
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(200);

            // session should be finalized
            const finalizedSession = await knex('finalized-sessions').where({ sessionId: session.id }).first();
            expect(finalizedSession.finalizedAt).not.to.be.null;
            expect(finalizedSession.isPublishable).to.be.true;

            const pixCoreResults = await knex('assessment-results').where({ assessmentId });
            expect(pixCoreResults).to.have.lengthOf(1);

            const cleaResult = await knex('complementary-certification-course-results').where({
              complementaryCertificationCourseId,
              complementaryCertificationBadgeId,
            });
            expect(cleaResult).to.have.lengthOf(1);
            expect(cleaResult[0].acquired).to.be.true;
          });
        });
      });
    });

    describe('When there were no challenges', function () {
      describe('when session is v3', function () {
        it('should set the finalized session as publishable', async function () {
          // given
          const { report, assessmentId, userId, session, certificationCourseId } =
            await _createSessionWithoutChallenge();
          const options = {
            method: 'PUT',
            payload: {
              data: {
                attributes: {
                  'examiner-global-comment': null,
                  'has-incident': false,
                  'has-joining-issue': true,
                },
                included: [
                  {
                    id: report.id,
                    type: 'certification-reports',
                    attributes: {
                      'certification-course-id': report.certificationCourseId,
                      'examiner-comment': 'What a fine lad this one',
                      'is-completed': false,
                      'abort-reason': 'technical',
                    },
                  },
                ],
              },
            },
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            url: `/api/sessions/${session.id}/finalization`,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const finalizedSession = await knex('finalized-sessions').where({ sessionId: session.id }).first();
          expect(finalizedSession.isPublishable).to.be.true;
          const assessmentResult = await knex('assessment-results').where({ assessmentId }).first();
          expect(assessmentResult.status).to.equal(AssessmentResult.status.CANCELLED);
          const assessment = await knex('assessments').where({ certificationCourseId }).first();
          expect(assessment.state).to.equal('endedDueToFinalization');
        });
      });
    });
  });
});

const _createSession = async ({ version = 2 } = {}) => {
  const session = databaseBuilder.factory.buildSession({ version });
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId: session.id, version });
  const certificationCourseId = certificationCourse.id;
  const candidate = databaseBuilder.factory.buildCertificationCandidate({
    userId: certificationCourse.userId,
    sessionId: certificationCourse.sessionId,
  });
  databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
  const report1 = databaseBuilder.factory.buildCertificationReport({
    sessionId: session.id,
    certificationCourseId,
  });
  const report2 = databaseBuilder.factory.buildCertificationReport({
    sessionId: session.id,
    certificationCourseId,
  });
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
    userId: certificationCourse.userId,
  }).id;

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

  const options = {
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
              'is-completed': true,
            },
          },
          {
            id: report2.id,
            type: 'certification-reports',
            attributes: {
              'certification-course-id': report2.certificationCourseId,
              'examiner-comment': 'What a fine lad this two',
              'is-completed': true,
            },
          },
        ],
      },
    },
    headers: {},
    url: `/api/sessions/${session.id}/finalization`,
  };

  const learningContent = [
    {
      id: 'recArea0',
      code: '66',
      competences: [
        {
          id: 'recCompetence0',
          index: '1.1',
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
  await mockLearningContent(learningContentObjects);

  return {
    session,
    options,
  };
};

const _createSessionWithoutChallenge = async () => {
  const version = 3;

  const learningContent = [
    {
      id: 'recArea0',
      competences: [
        {
          id: 'recCompetence0',
          index: '1.1',
        },
      ],
    },
  ];
  const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
  await mockLearningContent(learningContentObjects);

  const userId = databaseBuilder.factory.buildUser().id;
  const candidateId = databaseBuilder.factory.buildUser().id;
  const session = databaseBuilder.factory.buildSession({ version });
  databaseBuilder.factory.buildCertificationVersion({
    startDate: new Date('2024-01-01'),
  });
  databaseBuilder.factory.buildCertificationCenterMembership({
    userId,
    certificationCenterId: session.certificationCenterId,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    sessionId: session.id,
    userId: candidateId,
    reconciledAt: new Date('2024-01-01'),
  });
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    completedAt: null,
    version,
    abortReason: 'technical',
    userId: candidateId,
    createdAt: new Date('2025-01-01'),
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
    state: Assessment.states.STARTED,
  }).id;
  const report = databaseBuilder.factory.buildCertificationReport({
    sessionId: session.id,
    certificationCourseId,
  });
  await databaseBuilder.commit();

  return { assessmentId, report, userId, session, certificationCourseId };
};
