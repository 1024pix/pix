class SessionMassImportReport {
  constructor({ cachedValidatedSessionsKey, sessionsCount, emptySessionsCount, candidatesCount } = {}) {
    this.cachedValidatedSessionsKey = cachedValidatedSessionsKey;
    this.sessionsCount = sessionsCount;
    this.emptySessionsCount = emptySessionsCount;
    this.candidatesCount = candidatesCount;
  }
}

module.exports = SessionMassImportReport;
