import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DetailsController extends Controller {
  @tracked _targetProfileId;

  get currentTargetProfile() {
    return this.model.currentTargetProfiles?.find(({ id }) => id === this.targetProfileId);
  }

  get targetProfileId() {
    return this._targetProfileId ?? this.model.currentTargetProfiles?.[0].id;
  }

  @action
  switchTargetProfile() {
    this._targetProfileId = this.model.currentTargetProfiles?.find(({ id }) => id !== this.targetProfileId).id;
  }
}
