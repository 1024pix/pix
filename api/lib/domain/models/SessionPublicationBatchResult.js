class SessionPublicationBatchResult {
  constructor(batchId) {
    this.batchId = batchId;
    this.publicationErrors = {};
  }

  hasPublicationErrors() {
    return Object.keys(this.publicationErrors).length > 0;
  }

  addPublicationError(sessionId, error) {
    this.publicationErrors[sessionId] = error;
  }
}

module.exports = {
  SessionPublicationBatchResult,
};
