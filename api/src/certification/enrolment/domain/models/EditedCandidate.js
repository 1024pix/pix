export class EditedCandidate {
  constructor({ id, accessibilityAdjustmentNeeded = false }) {
    this.id = id;
    this.accessibilityAdjustmentNeeded = accessibilityAdjustmentNeeded;
    this.#validate();
  }

  #validate() {
    if (!this.id) {
      throw new Error('id is required');
    }
  }
}
