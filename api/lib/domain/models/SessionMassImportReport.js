class SessionMassImportReport {
  constructor({
    cachedValidatedSessionsKey,
    sessionsCount = 0,
    sessionsWithoutCandidatesCount = 0,
    candidatesCount = 0,
    errorReports = [],
  } = {}) {
    this.cachedValidatedSessionsKey = cachedValidatedSessionsKey;
    this.sessionsCount = sessionsCount;
    this.sessionsWithoutCandidatesCount = sessionsWithoutCandidatesCount;
    this.candidatesCount = candidatesCount;
    this.errorReports = errorReports;
  }

  get isValid() {
    return !this.errorReports.some(({ isBlocking }) => isBlocking);
  }

  addErrorReports(errors) {
    if (errors?.length) {
      this.errorReports.push(...errors);
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
