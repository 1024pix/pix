import { STATUSES as ORIGINAL_STATUSES } from '../../../learning-content/domain/models/Challenge.js';

export class SmartRandomChallenge {
  constructor({ id, locales, status, skillId, timer }) {
    this.id = id;
    this.locales = locales;
    this.status = status;
    this.skillId = skillId;
    this.timer = timer;
  }

  isTimed() {
    return !!this.timer && this.timer > 0;
  }
}
export const STATUSES = ORIGINAL_STATUSES;
