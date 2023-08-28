import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class DetailsController extends Controller {
  @tracked _targetProfileId;
  @tracked isToggleSwitched = true;

  get currentTargetProfile() {
    return this.model.currentTargetProfiles?.find(({ id }) => id === this.targetProfileId);
  }

  get targetProfileId() {
    return this._targetProfileId ?? this.model.currentTargetProfiles?.[0].id;
  }

  @action
  switchTargetProfile() {
    this.isToggleSwitched = !this.isToggleSwitched;
    this._targetProfileId = this.model.currentTargetProfiles?.find(({ id }) => id !== this.targetProfileId).id;
  }

  reset() {
    this._targetProfileId = null;
    this.isToggleSwitched = true;
  }
}
