class ResultRecipient {
  constructor({ sessionId, resultRecipientEmail, candidateIds = [] }) {
    this.sessionId = sessionId;
    this.resultRecipientEmail = resultRecipientEmail;
    this.candidateIds = candidateIds;
  }
}

export { ResultRecipient };
