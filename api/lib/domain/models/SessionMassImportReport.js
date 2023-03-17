class SessionMassImportReport {
  constructor({
    cachedValidatedSessionsKey,
    sessionsCount = 0,
    sessionsWithoutCandidatesCount = 0,
    candidatesCount = 0,
    blockingErrorReports = [],
    nonBlockingErrorReports = [],
  } = {}) {
    this.cachedValidatedSessionsKey = cachedValidatedSessionsKey;
    this.sessionsCount = sessionsCount;
    this.sessionsWithoutCandidatesCount = sessionsWithoutCandidatesCount;
    this.candidatesCount = candidatesCount;
    this.blockingErrorReports = blockingErrorReports;
    this.nonBlockingErrorReports = nonBlockingErrorReports;
  }

  get isValid() {
    return this.blockingErrorReports.length === 0;
  }

  addBlockingErrorReports(errors) {
    if (errors?.length) {
      this.blockingErrorReports.push(...errors);
    }
  }
  addNonBlockingErrorReports(errors) {
    if (errors?.length) {
      this.nonBlockingErrorReports.push(...errors);
    }
  }

  updateSessionsCounters(sessions) {
    this.sessionsWithoutCandidatesCount = sessions.filter(
      (session) => session.certificationCandidates.length === 0
    ).length;
    this.sessionsCount = sessions.length;
    this.candidatesCount = sessions.reduce(
      (currentCandidateCount, currentSession) => currentCandidateCount + currentSession.certificationCandidates.length,
      0
    );
  }
}

module.exports = SessionMassImportReport;
