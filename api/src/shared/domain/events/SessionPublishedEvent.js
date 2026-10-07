export class SessionPublishedEvent {
  constructor({ sessionId, publishedAt }) {
    this.sessionId = sessionId;
    this.publishedAt = publishedAt;
  }

  static get eventName() {
    return 'session.published';
  }

  get eventName() {
    return SessionPublishedEvent.eventName;
  }

  get payload() {
    return {
      sessionId: this.sessionId,
      publishedAt: this.publishedAt,
    };
  }
}
