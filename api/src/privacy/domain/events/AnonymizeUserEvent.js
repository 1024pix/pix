export class AnonymizeUserEvent {
  constructor({ userId, updatedByUserId }) {
    this.userId = userId;
    this.updatedByUserId = updatedByUserId;
  }

  static get eventName() {
    return 'anonymize-user.requested';
  }

  get eventName() {
    return AnonymizeUserEvent.eventName;
  }

  get payload() {
    return {
      userId: this.userId,
      updatedByUserId: this.updatedByUserId,
    };
  }

  get options() {
    return {};
  }
}
