class SessionPublicationBatchResult {
  constructor(batchId) {
    this.batchId = batchId;
    this.publicationErrors = {};
  }

  hasPublicationErrors() {
    return Boolean(Object.keys(this.publicationErrors).length);
  }

  addPublicationError(sessionId, error) {
    this.publicationErrors[sessionId] = error;
  }
}

export default {
  SessionPublicationBatchResult,
};
