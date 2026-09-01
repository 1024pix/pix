export class TargetProfileDetachedEvent {
  constructor({ targetProfileIdToDetach, complementaryCertificationId, complementaryCertificationName }) {
    this.targetProfileIdToDetach = targetProfileIdToDetach;
    this.complementaryCertificationId = complementaryCertificationId;
    this.complementaryCertificationName = complementaryCertificationName;
  }

  static get eventName() {
    return 'target-profile.detached';
  }

  get eventName() {
    return TargetProfileDetachedEvent.eventName;
  }

  get payload() {
    return {
      targetProfileIdToDetach: this.targetProfileIdToDetach,
      complementaryCertificationId: this.complementaryCertificationId,
      complementaryCertificationName: this.complementaryCertificationName,
    };
  }

  get options() {
    return {};
  }
}
