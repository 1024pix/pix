class SessionMassImportReport {
  constructor({ cachedValidatedSessionsKey, sessionsCount, sessionsWithoutCandidatesCount, candidatesCount } = {}) {
    this.cachedValidatedSessionsKey = cachedValidatedSessionsKey;
    this.sessionsCount = sessionsCount;
    this.sessionsWithoutCandidatesCount = sessionsWithoutCandidatesCount;
    this.candidatesCount = candidatesCount;
  }
}

module.exports = SessionMassImportReport;
