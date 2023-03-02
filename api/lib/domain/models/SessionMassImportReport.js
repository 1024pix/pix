class SessionMassImportReport {
  constructor({
    cachedValidatedSessionsKey,
    sessionsCount,
    sessionsWithoutCandidatesCount,
    candidatesCount,
    errorsReport,
  } = {}) {
    this.cachedValidatedSessionsKey = cachedValidatedSessionsKey;
    this.sessionsCount = sessionsCount;
    this.sessionsWithoutCandidatesCount = sessionsWithoutCandidatesCount;
    this.candidatesCount = candidatesCount;
    this.errorsReport = errorsReport;
  }
}

module.exports = SessionMassImportReport;
