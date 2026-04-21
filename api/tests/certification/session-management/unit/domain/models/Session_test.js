import sinon from 'sinon';

import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | SessionManagement | Unit | Domain | Models | Session', function () {
  context('#get isFinalized', function () {
    it('returns false when session is not finalized', function () {
      const session = domainBuilder.certification.sessionManagement.buildSession({ finalizedAt: null });
      expect(session.isFinalized).to.be.false;
    });

    it('returns true when session is finalized', function () {
      const session = domainBuilder.certification.sessionManagement.buildSession({ finalizedAt: new Date() });
      expect(session.isFinalized).to.be.true;
    });
  });

  context('#get hasExaminerGlobalComment', function () {
    it('returns false when session has no examiner global comment', function () {
      const session = domainBuilder.certification.sessionManagement.buildSession({ examinerGlobalComment: '' });
      expect(session.hasExaminerGlobalComment).to.be.false;
    });

    it('returns true when session has examiner global comment', function () {
      const session = domainBuilder.certification.sessionManagement.buildSession({
        examinerGlobalComment: 'Super stylé',
      });
      expect(session.hasExaminerGlobalComment).to.be.true;
    });
  });

  context('#get hasStarted', function () {
    it('returns false when session has not started', function () {
      const session = domainBuilder.certification.sessionManagement.buildSession({ certificationCourses: [] });
      expect(session.hasStarted).to.be.false;
    });

    it('returns true when session has started', function () {
      const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse();
      const session = domainBuilder.certification.sessionManagement.buildSession({
        certificationCourses: [certificationCourse],
      });
      expect(session.hasStarted).to.be.true;
    });
  });

  context('#get uncompletedCertificationCount', function () {
    it('returns the count of uncompleted certification (looking at their assessment state)', function () {
      const certificationCourses = [];
      for (const assessmentState of Object.values(Assessment.states)) {
        certificationCourses.push(
          domainBuilder.certification.sessionManagement.buildCertificationCourse({
            assessmentState,
          }),
        );
      }
      const session = domainBuilder.certification.sessionManagement.buildSession({ certificationCourses });
      expect(session.uncompletedCertificationCount).to.equal(3);
    });
  });

  context('#finalize', function () {
    let clock, now;

    beforeEach(function () {
      now = new Date('2024-11-16');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('finalizes the session and the certification courses', function () {
      const completionDate = new Date();
      const certificationCourseWithLegitAbortReason =
        domainBuilder.certification.sessionManagement.buildCertificationCourse({
          id: 1,
          updatedAt: new Date(),
          assessmentState: Assessment.states.STARTED,
          completedAt: null,
          abortReason: 'someLegitReason',
        });
      const certificationCourseWithAbortReasonToIgnore =
        domainBuilder.certification.sessionManagement.buildCertificationCourse({
          id: 2,
          updatedAt: new Date(),
          assessmentState: Assessment.states.COMPLETED,
          completedAt: completionDate,
          abortReason: null,
        });
      const session = domainBuilder.certification.sessionManagement.buildSession({
        finalizedAt: null,
        hasIncident: false,
        hasJoiningIssue: false,
        certificationCourses: [certificationCourseWithLegitAbortReason, certificationCourseWithAbortReasonToIgnore],
      });
      const certificationReports = [
        {
          certificationCourseId: 1,
          abortReason: 'someLegitReason',
        },
        {
          certificationCourseId: 2,
          abortReason: 'ignoredAbortReason',
        },
      ];

      session.finalize({
        examinerGlobalComment: 'coucou',
        hasIncident: true,
        hasJoiningIssue: true,
        certificationReports,
      });

      expect(session).to.deepEqualInstance(
        domainBuilder.certification.sessionManagement.buildSession({
          examinerGlobalComment: 'coucou',
          hasIncident: true,
          hasJoiningIssue: true,
          finalizedAt: now,
          certificationCourses: [
            domainBuilder.certification.sessionManagement.buildCertificationCourse({
              id: 1,
              updatedAt: now,
              assessmentState: Assessment.states.STARTED,
              completedAt: null,
              abortReason: 'someLegitReason',
            }),
            domainBuilder.certification.sessionManagement.buildCertificationCourse({
              id: 2,
              updatedAt: now,
              assessmentState: Assessment.states.COMPLETED,
              completedAt: completionDate,
              abortReason: null,
            }),
          ],
        }),
      );
    });
  });
});
