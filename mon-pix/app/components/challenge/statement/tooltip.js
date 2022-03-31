import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Tooltip extends Component {
  @service currentUser;
  @tracked shouldDisplayTooltip = false;

  constructor() {
    super(...arguments);
    this._showTooltip();
  }

  _showTooltip() {
    if (this._hasUserNotSeenOtherChallengesTooltip()) {
      this.shouldDisplayTooltip = true;
    } else {
      this.shouldDisplayTooltip = false;
    }
  }

  @action
  displayTooltip(value) {
    if (this._hasUserSeenOtherChallengesTooltip()) {
      this.shouldDisplayTooltip = value;
    } else if (!this._isUserConnected()) {
      this.shouldDisplayTooltip = value;
    }
  }

  get shouldDisplayButton() {
    if (this._hasUserNotSeenOtherChallengesTooltip()) {
      return true;
    }
    return false;
  }

  _hasUserSeenOtherChallengesTooltip() {
    return this._isUserConnected() && this.currentUser.user.hasSeenOtherChallengesTooltip;
  }

  _hasUserNotSeenOtherChallengesTooltip() {
    return this._isUserConnected() && !this.currentUser.user.hasSeenOtherChallengesTooltip;
  }

  _isUserConnected() {
    return this.currentUser.user;
  }

  @action
  async confirmInformationIsRead() {
    this.shouldDisplayTooltip = false;
    await this._rememberUserHasSeenChallengeTooltip();
  }

  async _rememberUserHasSeenChallengeTooltip() {
    if (!this.currentUser.user) return;

    if (!this.currentUser.user.hasSeenOtherChallengesTooltip) {
      await this.currentUser.user.save({ adapterOptions: { tooltipChallengeType: 'other' } });
    }
  }
}
