import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Tooltip extends Component {
  @service currentUser;
  @tracked shouldDisplayTooltip = false;

  constructor() {
    super(...arguments);
    if (this.isFocusedChallenge) {
      this._showTooltip();
    }
  }

  get isFocusedChallenge() {
    return this.args.challenge.focused;
  }

  get isChallengeWithTooltip() {
    return this.isFocusedChallenge;
  }

  _showTooltip() {
    if (this._hasCurrentUserNotSeenFocusedChallengeTooltip()) {
      this.shouldDisplayTooltip = true;
    } else {
      this.shouldDisplayTooltip = false;
      this._notifyChallengeTooltipIsClosed();
    }
  }

  _hasCurrentUserSeenFocusedChallengeTooltip() {
    return this._isUserConnected() && this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }

  _hasCurrentUserNotSeenFocusedChallengeTooltip() {
    return this._isUserConnected() && !this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }

  _isUserConnected() {
    return this.currentUser.user;
  }

  @action
  confirmInformationIsRead() {
    this.shouldDisplayTooltip = false;
    this._notifyChallengeTooltipIsClosed();
  }

  _notifyChallengeTooltipIsClosed() {
    this.args.onTooltipClose();
  }

  @action
  displayTooltip(value) {
    if (this.isFocusedChallenge) {
      if (this._hasCurrentUserSeenFocusedChallengeTooltip() || !this._isUserConnected()) {
        this.shouldDisplayTooltip = value;
      }
    }
  }

  get shouldDisplayButton() {
    return this._hasCurrentUserNotSeenFocusedChallengeTooltip();
  }
}
