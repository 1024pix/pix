import sinon from 'sinon';

import {
  SessionAlreadyFinalizedError,
  SessionWithMissingAbortReasonError,
  SessionWithoutStartedCertificationError,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { usecases } from '../../../../../../src/certification/session-management/domain/usecases/index.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session Management | Integration | Domain | UseCase | Finalize Session ', function () {
  const hasIncident = true;
  const hasJoiningIssue = true;
  const examinerGlobalComment = 'Le meilleur global comment de tous les temps';
  let sessionId, clock;
  const now = new Date('2026-01-01');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when session does not exist', function () {
    it('throws a NotFound error', async function () {
      const err = await catchErr(usecases.finalizeSession)({
        sessionId: 1234,
        hasIncident,
        hasJoiningIssue,
        examinerGlobalComment,
        certificationReports: [],
      });

      expect(err).to.deepEqualInstance(new NotFoundError('Session introuvable : id 1234'));
    });
  });

  context('when session exists', function () {
    context('when session is already finalized', function () {
      it('throws an SessionAlreadyFinalizedError', async function () {
        sessionId = databaseBuilder.factory.buildSession({ finalizedAt: new Date() }).id;
        await databaseBuilder.commit();

        const err = await catchErr(usecases.finalizeSession)({
          sessionId,
          hasIncident,
          hasJoiningIssue,
          examinerGlobalComment,
          certificationReports: [],
        });

        expect(err).to.deepEqualInstance(new SessionAlreadyFinalizedError());
      });
    });

    context('when session is not finalized yet', function () {
      let sessionData;
      beforeEach(function () {
        sessionData = {
          examinerGlobalComment: null,
          hasIncident: false,
          hasJoiningIssue: false,
          certificationCenterName: 'Some certification center name',
          date: '2017-12-08',
          time: '14:30:00',
        };
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          name: sessionData.certificationCenterName,
        }).id;
        sessionId = databaseBuilder.factory.buildSession({
          ...sessionData,
          certificationCenterId,
          certificationCenter: sessionData.certificationCenterName,
          finalizedAt: null,
        }).id;
        return databaseBuilder.commit();
      });

      context('when session has not started', function () {
        it('throws an SessionWithoutStartedCertificationError', async function () {
          const err = await catchErr(usecases.finalizeSession)({
            sessionId,
            hasIncident,
            hasJoiningIssue,
            examinerGlobalComment,
            certificationReports: [],
          });

          expect(err).to.deepEqualInstance(new SessionWithoutStartedCertificationError());
        });
      });

      context('when session happened', function () {
        let certificationReports;
        let certificationCourseIdForCompleted, certificationCourseIdForNotCompletedWithAbortReason;
        beforeEach(function () {
          certificationReports = [];
          certificationCourseIdForCompleted = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            abortReason: null,
            version: 3,
            endedAt: null,
            completedAt: null,
          }).id;
          databaseBuilder.factory.buildAssessment({
            id: 1,
            state: Assessment.states.COMPLETED,
            certificationCourseId: certificationCourseIdForCompleted,
            updatedAt: new Date('2021-10-29'),
          });
          certificationReports.push(
            domainBuilder.buildCertificationReport({
              certificationCourseId: certificationCourseIdForCompleted,
              abortReason: null,
              isCompleted: true,
            }),
          );
          certificationCourseIdForNotCompletedWithAbortReason = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            version: 3,
            completedAt: null,
            endedAt: null,
            abortReason: 'candidate',
          }).id;
          databaseBuilder.factory.buildAssessment({
            id: 2,
            state: Assessment.states.STARTED,
            certificationCourseId: certificationCourseIdForNotCompletedWithAbortReason,
            updatedAt: new Date('2021-10-29'),
          });
          certificationReports.push(
            domainBuilder.buildCertificationReport({
              certificationCourseId: certificationCourseIdForNotCompletedWithAbortReason,
              abortReason: 'candidate',
              isCompleted: false,
            }),
          );
        });

        context('when some certifications tests not completed do not have an abort reason in the report', function () {
          it('throws an SessionWithMissingAbortReasonError', async function () {
            const certificationCourseIdForNotCompletedWithoutAbortReason =
              databaseBuilder.factory.buildCertificationCourse({
                sessionId,
              }).id;
            databaseBuilder.factory.buildAssessment({
              state: Assessment.states.STARTED,
              certificationCourseId: certificationCourseIdForNotCompletedWithoutAbortReason,
            });
            certificationReports.push(
              domainBuilder.buildCertificationReport({
                certificationCourseId: certificationCourseIdForNotCompletedWithoutAbortReason,
                abortReason: null,
                isCompleted: true,
              }),
            );
            await databaseBuilder.commit();

            const err = await catchErr(usecases.finalizeSession)({
              sessionId,
              hasIncident,
              hasJoiningIssue,
              examinerGlobalComment,
              certificationReports,
            });

            expect(err).to.deepEqualInstance(new SessionWithMissingAbortReasonError());
          });
        });

        context('success case', function () {
          it('finalizes the session and the related certifications, also unaborts any completed certifications', async function () {
            const certificationCourseIdToUnabort = databaseBuilder.factory.buildCertificationCourse({
              sessionId,
              endedAt: null,
              completedAt: new Date('2022-01-01'),
              abortReason: 'technical',
              version: 3,
            }).id;
            databaseBuilder.factory.buildAssessment({
              id: 3,
              state: Assessment.states.ENDED_BY_INVIGILATOR,
              certificationCourseId: certificationCourseIdToUnabort,
              updatedAt: new Date('2021-10-29'),
            });
            certificationReports.push(
              domainBuilder.buildCertificationReport({
                certificationCourseId: certificationCourseIdToUnabort,
                abortReason: 'technical',
                isCompleted: false,
              }),
            );
            await databaseBuilder.commit();

            const finalizedSession = await usecases.finalizeSession({
              sessionId,
              hasIncident,
              hasJoiningIssue,
              examinerGlobalComment,
              certificationReports,
            });

            expect(finalizedSession).to.deepEqualInstance(
              domainBuilder.certification.sessionManagement.buildSession({
                ...sessionData,
                id: sessionId,
                finalizedAt: now,
                examinerGlobalComment,
                hasIncident,
                hasJoiningIssue,
                certificationCourses: [
                  domainBuilder.certification.sessionManagement.buildCertificationCourse({
                    id: certificationCourseIdForCompleted,
                    abortReason: null,
                    assessmentId: 1,
                    assessmentState: Assessment.states.COMPLETED,
                    assessmentLatestActivityAt: new Date('2021-10-29'),
                    completedAt: null,
                    endedAt: null,
                    updatedAt: now,
                    version: 3,
                  }),
                  domainBuilder.certification.sessionManagement.buildCertificationCourse({
                    id: certificationCourseIdForNotCompletedWithAbortReason,
                    abortReason: 'candidate',
                    assessmentId: 2,
                    assessmentState: Assessment.states.STARTED,
                    assessmentLatestActivityAt: new Date('2021-10-29'),
                    completedAt: null,
                    endedAt: null,
                    updatedAt: now,
                    version: 3,
                  }),
                  domainBuilder.certification.sessionManagement.buildCertificationCourse({
                    id: certificationCourseIdToUnabort,
                    abortReason: null,
                    assessmentId: 3,
                    assessmentState: Assessment.states.ENDED_BY_INVIGILATOR,
                    assessmentLatestActivityAt: new Date('2021-10-29'),
                    endedAt: null,
                    completedAt: new Date('2022-01-01'),
                    updatedAt: now,
                    version: 3,
                  }),
                ],
              }),
            );
            const sessionFromDB = await knex('sessions')
              .select('finalizedAt', 'hasJoiningIssue', 'hasIncident', 'examinerGlobalComment')
              .first();
            expect(sessionFromDB).to.deep.equal({
              hasIncident,
              hasJoiningIssue,
              examinerGlobalComment,
              finalizedAt: now,
            });
            const certificationCoursesFromDB = await knex('certification-courses')
              .select('updatedAt', 'abortReason')
              .orderBy('id');
            expect(certificationCoursesFromDB).to.deep.equal([
              {
                updatedAt: now,
                abortReason: null,
              },
              {
                updatedAt: now,
                abortReason: 'candidate',
              },
              {
                updatedAt: now,
                abortReason: null,
              },
            ]);
          });
        });
      });
    });
  });
});
