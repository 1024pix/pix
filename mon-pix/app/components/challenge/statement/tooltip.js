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

  get isFocusedChallenge() {
    return this.args.challenge.focused;
  }

  _showTooltip() {
    if (this.isFocusedChallenge && this._hasCurrentUserNotSeenFocusedChallengeTooltip() || !this.isFocusedChallenge && this._hasCurrentUserNotSeenOtherChallengesTooltip()) {
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

  _hasCurrentUserSeenOtherChallengesTooltip() {
    return this._isUserConnected() && this.currentUser.user.hasSeenOtherChallengesTooltip;
  }

  _hasCurrentUserNotSeenOtherChallengesTooltip() {
    return this._isUserConnected() && !this.currentUser.user.hasSeenOtherChallengesTooltip;
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
    else if (!this.isFocusedChallenge) {
      if (this._hasCurrentUserSeenOtherChallengesTooltip() || !this._isUserConnected()) {
        this.shouldDisplayTooltip = value;
      }
    }
  }

  get shouldDisplayButton() {
    if (this.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      return true;
    }
    else if (!this.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenOtherChallengesTooltip) {
      return true;
    }
    return false;
  }
}
