import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class FocusedTooltip extends Component {
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
    if (this.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      this.shouldDisplayTooltip = true;
    }
    else if (this.isFocusedChallenge && this.currentUser.user && this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      this._notifyChallengeTooltipIsClosed();
    }
    else if (this.isFocusedChallenge) {
      this._notifyChallengeTooltipIsClosed();
    }
  }

  @action
  hideTooltip() {
    this.shouldDisplayTooltip = false;
    this._notifyChallengeTooltipIsClosed();
  }

  _notifyChallengeTooltipIsClosed() {
    this.args.onTooltipClose();
  }

  @action
  showTooltipOnMouseEnter() {
    if (this.isFocusedChallenge && this.currentUser.user && this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      this.shouldDisplayTooltip = true;
    }
    if (this.isFocusedChallenge && !this.currentUser.user) {
      this.shouldDisplayTooltip = true;
    }
  }

  @action
  hideTooltipOnMouseLeave() {
    if (this.isFocusedChallenge && this.currentUser.user && this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      this.shouldDisplayTooltip = false;
    }
    if (this.isFocusedChallenge && !this.currentUser.user) {
      this.shouldDisplayTooltip = false;
    }
  }

  get shouldDisplayButton() {
    return this.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }
}
