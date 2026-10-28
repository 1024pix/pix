export type SessionPublishedEventProps = {
  sessionId: number;
  publishedAt: Date;
};

export class SessionPublishedEvent {
  #sessionId: number;
  #publishedAt: Date;

  constructor({ sessionId, publishedAt }: SessionPublishedEventProps) {
    this.#sessionId = sessionId;
    this.#publishedAt = publishedAt;
  }

  static get eventName() {
    return 'session.published';
  }

  get eventName() {
    return SessionPublishedEvent.eventName;
  }

  get payload() {
    return {
      sessionId: this.#sessionId,
      publishedAt: this.#publishedAt,
    };
  }
}
