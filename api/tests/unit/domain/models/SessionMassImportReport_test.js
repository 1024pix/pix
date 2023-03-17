const SessionMassImportReport = require('../../../../lib/domain/models/SessionMassImportReport');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | SessionMassImportReport', function () {
  context('#addBlockingErrorsReports', function () {
    context('when there are reports', function () {
      it('should add blocking errors reports', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          blockingErrorReports: [0],
        });

        // when
        sessionMassImportReport.addBlockingErrorReports([1, 2, 3]);

        // then
        expect(sessionMassImportReport.blockingErrorReports.length).to.equal(4);
      });
    });

    context('when there are no reports', function () {
      it('should do nothing', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({ blockingErrorReports: [0] });

        // when
        sessionMassImportReport.addBlockingErrorReports();

        // then
        expect(sessionMassImportReport.blockingErrorReports.length).to.equal(1);
      });
    });
  });

  context('#addNonBlockingErrorReports', function () {
    context('when there are reports', function () {
      it('should add blocking errors reports', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          nonBlockingErrorReports: [0],
        });

        // when
        sessionMassImportReport.addNonBlockingErrorReports([1, 2, 3]);

        // then
        expect(sessionMassImportReport.nonBlockingErrorReports.length).to.equal(4);
      });
    });

    context('when there are no reports', function () {
      it('should do nothing', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({ nonBlockingErrorReports: [0] });

        // when
        sessionMassImportReport.addNonBlockingErrorReports();

        // then
        expect(sessionMassImportReport.nonBlockingErrorReports.length).to.equal(1);
      });
    });
  });

  context('#isValid', function () {
    context('when there are blocking error reports', function () {
      it('should return false', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          nonBlockingErrorReports: [1],
          blockingErrorReports: [1],
        });

        // when
        const isValid = sessionMassImportReport.isValid;

        // then
        expect(isValid).to.be.false;
      });
    });

    context('when there are no blocking error reports', function () {
      it('should return true', function () {
        // given
        const sessionMassImportReport = new SessionMassImportReport({
          nonBlockingErrorReports: [1],
          blockingErrorReports: [],
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
