import { SessionMassImportReport } from '../../../../../../src/certification/session/domain/models/SessionMassImportReport.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | SessionMassImportReport', function () {
  context('#addErrorsReports', function () {
    context('when there are reports', function () {
      it('should add blocking errors reports', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          errorReports: [0],
        });

        // when
        sessionMassImportReport.addErrorReports([1, 2, 3]);

        // then
        expect(sessionMassImportReport.errorReports.length).to.equal(4);
      });
    });

    context('when there are no reports', function () {
      it('should do nothing', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({ errorReports: [0] });

        // when
        sessionMassImportReport.addErrorReports();

        // then
        expect(sessionMassImportReport.errorReports.length).to.equal(1);
      });
    });
  });

  context('#isValid', function () {
    context('when there are blocking error reports', function () {
      it('should return false', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          errorReports: [{ isBlocking: true }],
        });

        // when
        const isValid = sessionMassImportReport.isValid;

        // then
        expect(isValid).to.be.false;
      });
    });

    context('when there are non blocking error reports', function () {
      it('should return true', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          errorReports: [{ isBlocking: false }],
        });

        // when
        const isValid = sessionMassImportReport.isValid;

        // then
        expect(isValid).to.be.true;
      });
    });

    context('when there are no error reports', function () {
      it('should return true', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          errorReports: [],
        });

        // when
        const isValid = sessionMassImportReport.isValid;

        // then
        expect(isValid).to.be.true;
      });
    });

    context('#updateSessionsCounter', function () {
      context('when there is no session', function () {
        it('should update sessionsWithoutCandidatesCount, sessionsCount, candidatesCount to 0', function () {
          // given
          const sessionMassImportReport = new SessionMassImportReport({});
          const sessions = [];

          // when
          sessionMassImportReport.updateSessionsCounters(sessions);

          // then
          expect(sessionMassImportReport.sessionsCount).to.equal(0);
          expect(sessionMassImportReport.sessionsWithoutCandidatesCount).to.equal(0);
          expect(sessionMassImportReport.candidatesCount).to.equal(0);
        });
      });

      context('when there are sessions', function () {
        it('should update sessionsWithoutCandidatesCount, sessionsCount, candidatesCount to 0', function () {
          // given
          const sessionMassImportReport = new SessionMassImportReport({});
          const sessions = [
            {
              certificationCandidates: [1, 2, 3],
            },
            {
              certificationCandidates: [1],
            },
            {
              certificationCandidates: [],
            },
          ];

          // when
          sessionMassImportReport.updateSessionsCounters(sessions);

          // then
          expect(sessionMassImportReport.sessionsCount).to.equal(3);
          expect(sessionMassImportReport.sessionsWithoutCandidatesCount).to.equal(1);
          expect(sessionMassImportReport.candidatesCount).to.equal(4);
        });
      });
    });
  });
});
