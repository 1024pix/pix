export class PublishSessionEvent {
  constructor({ sessionId, publishedAt = new Date() }) {
    this.sessionId = sessionId;
    this.publishedAt = publishedAt;
  }

  static get eventName() {
    return 'publish-session.requested';
  }

  get eventName() {
    return PublishSessionEvent.eventName;
  }

  get payload() {
    return {
      sessionId: this.sessionId,
      publishedAt: this.publishedAt,
    };
  }
}
